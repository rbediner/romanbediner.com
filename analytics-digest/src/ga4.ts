// Minimal Google Analytics Data API (GA4) client for Cloudflare Workers.
// No Google client libraries -- those assume a Node runtime with fs/crypto
// modules the Workers runtime doesn't provide. This does the service-account
// JWT Bearer flow by hand with Web Crypto, which Workers does support.

export interface ServiceAccountKey {
  client_email: string;
  private_key: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // epoch ms
}

let tokenCache: CachedToken | null = null;

function base64UrlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of arr) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToPkcs8(pem: string): ArrayBuffer {
  const clean = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function signJwt(key: ServiceAccountKey): Promise<string> {
  const header = { alg: "RS256", typ: "JWT" };
  const nowSec = Math.floor(Date.now() / 1000);
  const claims = {
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: nowSec,
    exp: nowSec + 3600,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const claimsB64 = base64UrlEncode(encoder.encode(JSON.stringify(claims)));
  const signingInput = `${headerB64}.${claimsB64}`;

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(key.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    encoder.encode(signingInput)
  );

  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function getAccessToken(key: ServiceAccountKey): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.accessToken;
  }

  const jwt = await signJwt(key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    throw new Error(`GA4 token exchange failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

export interface DateRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  name: string;
}

export interface ReportRequest {
  dateRanges: DateRange[];
  dimensions?: string[];
  metrics: string[];
  dimensionFilter?: unknown;
  orderBys?: unknown[];
  limit?: number;
}

export interface ReportRow {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}

export interface ReportResult {
  dimensionHeaders: { name: string }[];
  metricHeaders: { name: string }[];
  rows: ReportRow[];
}

/** Dimension filter excluding rows whose pagePath contains the given marker (e.g. staging/preview paths). */
export function excludePreviewPathFilter(marker: string) {
  return {
    notExpression: {
      filter: {
        fieldName: "pagePath",
        stringFilter: { matchType: "CONTAINS", value: marker, caseSensitive: false },
      },
    },
  };
}

/**
 * Dimension filter excluding rows whose sessionSource contains "localhost" (local dev
 * traffic). Mirrors the Looker Studio "Page path filter" second clause -- keep these two
 * in sync; see the "Companion system: Looker Studio report" section of README.md.
 */
export function excludeLocalhostFilter() {
  return {
    notExpression: {
      filter: {
        fieldName: "sessionSource",
        stringFilter: { matchType: "CONTAINS", value: "localhost", caseSensitive: false },
      },
    },
  };
}

/** Dimension filter matching rows for exactly one event name (e.g. resource_card_click). */
export function eventNameFilter(name: string) {
  return {
    filter: {
      fieldName: "eventName",
      stringFilter: { matchType: "EXACT", value: name, caseSensitive: false },
    },
  };
}

/** Dimension filter excluding a specific list of literal event names. */
export function excludeEventNamesFilter(eventNames: string[]) {
  return {
    notExpression: {
      filter: {
        fieldName: "eventName",
        inListFilter: { values: eventNames },
      },
    },
  };
}

/** AND-combine multiple dimension filter expressions. */
export function andFilters(...expressions: unknown[]) {
  const filtered = expressions.filter(Boolean);
  if (filtered.length === 1) return filtered[0];
  return { andGroup: { expressions: filtered } };
}

/** Fetch with a short backoff retry on 429 / 5xx. Cloudflare Workers call out
 * from shared egress IPs that Google intermittently flags with a transient
 * "automated queries" 429 (an HTML "Sorry" page, not a JSON API error); a
 * couple of spaced retries usually rides it out instead of failing the run. */
async function fetchWithRetry(url: string, init: RequestInit, attempts = 3): Promise<Response> {
  let res = await fetch(url, init);
  for (let i = 1; i < attempts && (res.status === 429 || res.status >= 500); i++) {
    await new Promise((resolve) => setTimeout(resolve, 1500 * i)); // 1.5s, then 3s
    res = await fetch(url, init);
  }
  return res;
}

export async function batchRunReports(
  key: ServiceAccountKey,
  propertyId: string,
  requests: ReportRequest[]
): Promise<ReportResult[]> {
  const accessToken = await getAccessToken(key);

  // GA4 Data API expects metrics/dimensions as { name } objects, not bare
  // strings. We keep the convenient string[] shape internally and convert
  // only here, at the API boundary.
  const toApiRequest = (r: ReportRequest) => {
    const apiReq: Record<string, unknown> = {
      ...r,
      metrics: r.metrics.map((name) => ({ name })),
    };
    if (r.dimensions) apiReq.dimensions = r.dimensions.map((name) => ({ name }));
    return apiReq;
  };

  // GA4 caps batchRunReports at 5 report requests per call, so split into
  // chunks and concatenate the reports back in the original request order.
  const CHUNK_SIZE = 5;
  const results: ReportResult[] = [];
  for (let i = 0; i < requests.length; i += CHUNK_SIZE) {
    const apiRequests = requests.slice(i, i + CHUNK_SIZE).map(toApiRequest);
    const res = await fetchWithRetry(
      `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:batchRunReports`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests: apiRequests }),
      }
    );

    if (!res.ok) {
      throw new Error(`GA4 batchRunReports failed: ${res.status} ${await res.text()}`);
    }

    const data = (await res.json()) as { reports: ReportResult[] };
    results.push(...data.reports);
  }
  return results;
}
