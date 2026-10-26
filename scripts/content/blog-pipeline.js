/*
 * Purpose:
 * - Prepare one evidence-led editorial brief per week without publishing content.
 * Architectural role:
 * - Offline intake step, separate from the public article schema and site build.
 * Dependencies:
 * - Node.js builtins and docs/blog/editorial-backlog.json only.
 * Security/CSP considerations:
 * - No network, model, shell, scheduling or deployment calls. Drafts stay outside the repo.
 * Migration considerations:
 * - Keep brief schema independent from article records; migrate explicitly if schema changes.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const BACKLOG = path.join(ROOT, 'docs/blog/editorial-backlog.json');
const DEFAULT_OUTPUT = path.resolve(ROOT, '..', 'blog-work');
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const BRIEF_FILE = /^\d{4}-\d{2}-\d{2}\.brief\.json$/;

const HELP = `Usage: node scripts/content/blog-pipeline.js [--week YYYY-MM-DD] [--output <directory>] [--write]

Default: dry-run. Prints a complete JSON brief; creates no files.
--week    Monday starting the editorial week. Defaults to the current Monday in America/New_York.
--output  Draft directory outside this repository (default: ../blog-work).
--write   Save one JSON brief per week using exclusive creation. Never overwrite.
--help    Show this help.

Topics are selected in backlog order: planned, then not already briefed.
An existing week is retained. Exhausted backlog and invalid inputs exit nonzero.
No article generation, model calls, publishing, scheduling or production deployment occurs.
`;

function currentWeek() {
  const localDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = Object.fromEntries(localDate.map(item => [item.type, item.value]));
  const date = new Date(`${part.year}-${part.month}-${part.day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 6) % 7);
  return date.toISOString().slice(0, 10);
}

function validateWeek(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('--week must be YYYY-MM-DD.');
  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new Error('--week must be a real calendar date.');
  }
  if (date.getUTCDay() !== 1) throw new Error('--week must be a Monday (the editorial week start).');
  return value;
}

function parseArgs(args) {
  const options = { week: currentWeek(), output: DEFAULT_OUTPUT, write: false, help: false };
  const seen = new Set();
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!['--week', '--output', '--write', '--help'].includes(arg)) throw new Error(`Unknown option: ${arg}`);
    if (seen.has(arg)) throw new Error(`Duplicate option: ${arg}`);
    seen.add(arg);
    if (arg === '--help') options.help = true;
    else if (arg === '--write') options.write = true;
    else {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`${arg} requires a value.`);
      options[arg.slice(2)] = value;
    }
  }
  if (!options.help) validateWeek(options.week);
  options.output = path.resolve(options.output);
  return options;
}

// Resolve existing ancestors too, preventing a symlink from placing briefs in the repo.
function resolveDestination(destination) {
  let ancestor = destination;
  const suffix = [];
  while (!fs.existsSync(ancestor)) {
    suffix.unshift(path.basename(ancestor));
    const parent = path.dirname(ancestor);
    if (parent === ancestor) throw new Error(`Cannot resolve output: ${destination}`);
    ancestor = parent;
  }
  if (!fs.statSync(ancestor).isDirectory()) throw new Error(`Output ancestor is not a directory: ${ancestor}`);
  const resolved = path.join(fs.realpathSync(ancestor), ...suffix);
  const relative = path.relative(fs.realpathSync(ROOT), resolved);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) {
    throw new Error('Brief output must be outside this repository. Use a private working directory.');
  }
  return resolved;
}

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be nonempty text.`);
}

function validateBacklog(backlog) {
  if (backlog.schemaVersion !== 1 || !Array.isArray(backlog.topics)) throw new Error('Unsupported editorial backlog schema.');
  const slugs = new Set();
  for (const topic of backlog.topics) {
    if (!topic || !SLUG.test(topic.slug || '')) throw new Error('Every topic needs a lowercase, hyphenated slug.');
    if (slugs.has(topic.slug)) throw new Error(`Duplicate backlog slug: ${topic.slug}`);
    slugs.add(topic.slug);
    if (!['planned', 'in-progress', 'hold', 'published'].includes(topic.status)) throw new Error(`Invalid status for ${topic.slug}`);
    for (const field of ['title', 'pillar', 'audience', 'primaryQuery', 'searchIntent', 'thesis', 'originalInsight']) {
      requireText(topic[field], `${topic.slug}.${field}`);
    }
    if (!Array.isArray(topic.evidenceNeeded) || !topic.evidenceNeeded.length) throw new Error(`${topic.slug} requires evidenceNeeded.`);
    for (const evidence of topic.evidenceNeeded) requireText(evidence, `${topic.slug}.evidenceNeeded`);
    if (!Array.isArray(topic.sources) || !topic.sources.length) throw new Error(`${topic.slug} requires sources.`);
    for (const source of topic.sources) {
      if (!['public', 'private-research'].includes(source.visibility)) throw new Error(`Invalid source visibility: ${topic.slug}`);
      requireText(source.purpose, `${topic.slug}.source.purpose`);
      let url;
      try { url = new URL(source.url); } catch { throw new Error(`Invalid source URL: ${topic.slug}`); }
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error(`Source must be a credential-free HTTPS URL: ${topic.slug}`);
    }
    if (!topic.cta || !['affiliate', 'resource', 'advisory'].includes(topic.cta.type)) throw new Error(`Invalid CTA: ${topic.slug}`);
    requireText(topic.cta.intent, `${topic.slug}.cta.intent`);
  }
  return backlog;
}

function readHistory(output) {
  if (!fs.existsSync(output)) return [];
  return fs.readdirSync(output).filter(name => BRIEF_FILE.test(name)).sort().map(name => {
    const file = path.join(output, name);
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error(`Brief history must contain regular files: ${file}`);
    let brief;
    try { brief = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { throw new Error(`Cannot parse existing brief: ${file}`); }
    if (brief.schemaVersion !== 1 || brief.kind !== 'editorial-brief' || !SLUG.test(brief.topic?.slug || '') || `${brief.week}.brief.json` !== name) {
      throw new Error(`Invalid brief history: ${file}. Repair it explicitly before continuing.`);
    }
    return brief;
  });
}

function createBrief(topic, week) {
  const checks = [
    ['sources', 'Open every cited public source, record retrieval date, and verify each factual claim against it.'],
    ['privacy', 'Remove private channels, member/client names, identifiers, transcripts, credentials, payout data and confidential operating details. Obtain permission for any testimonial or named story.'],
    ['originality', 'Add Roman’s own decision, tradeoff and actionable lesson. Do not turn generic summaries into claimed experience.'],
    ['claims', 'No invented results, ROI, revenue, savings, quotes, adoption or feature availability. Label hypotheses and unmeasured outcomes.'],
    ['role', 'Identify Roman as Fractional COO at Agentic Society.'],
    ['offer', 'Recheck the current public Agentic Society offer and distinguish private internal examples from included member benefits.'],
    ['affiliate', 'If a referral CTA is relevant, disclose the COO relationship and potential commission before or near the first CTA; verify the referral destination and use rel="sponsored noopener".'],
    ['editorial', 'Review title, intent, accessible visual explanation, useful next step and internal links. No fabricated pricing or named member case studies.'],
    ['staging', 'Validate the article record and static build, review mobile/desktop staging, check links, metadata and affiliate tracking.'],
    ['production', 'Record Roman’s explicit approval of the exact reviewed staging revision before any production action.']
  ];
  return {
    schemaVersion: 1, kind: 'editorial-brief', week,
    author: { name: 'Roman Bediner', role: 'Fractional COO', organization: 'Agentic Society' },
    topic,
    sourceIntake: topic.sources.map(source => ({ ...source, verification: 'pending', checkedAt: null, publishableExcerpt: null })),
    claimLedger: [],
    draftOutline: [
      'A specific operator problem and who this article helps',
      'Verified evidence, with public source attribution',
      'Roman’s original decision, tradeoff and lesson',
      'A visual workflow or practical example with no private records',
      'An actionable next step, with a relevant and disclosed CTA'
    ],
    reviewChecklist: checks.map(([id, requirement]) => ({ id, requirement, status: 'pending', evidence: null })),
    publication: { state: 'brief', stagingApproved: false, productionApproved: false, reviewedRevision: null, reviewer: null },
    nextAction: 'Research and draft in the private workspace. This brief is not a publishable article or an approval.'
  };
}

function run(options) {
  const output = resolveDestination(options.output);
  const backlog = validateBacklog(JSON.parse(fs.readFileSync(BACKLOG, 'utf8')));
  const history = readHistory(output);
  const existing = history.find(brief => brief.week === options.week);
  if (existing) return { status: 'existing', file: path.join(output, `${options.week}.brief.json`), brief: existing };
  const used = new Set(history.map(brief => brief.topic.slug));
  const topic = backlog.topics.find(item => item.status === 'planned' && !used.has(item.slug));
  if (!topic) throw new Error('No eligible planned topics remain. Review and extend the backlog; nothing was written.');
  const brief = createBrief(topic, options.week);
  const file = path.join(output, `${options.week}.brief.json`);
  if (options.write) {
    fs.mkdirSync(output, { recursive: true, mode: 0o700 });
    fs.writeFileSync(file, `${JSON.stringify(brief, null, 2)}\n`, { flag: 'wx', mode: 0o600 });
  }
  return { status: options.write ? 'written' : 'dry-run', file, brief };
}

function main(args) {
  try {
    const options = parseArgs(args);
    if (options.help) { process.stdout.write(HELP); return; }
    process.stdout.write(`${JSON.stringify(run(options), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`Blog pipeline: ${error.message}\n`);
    process.exitCode = 1;
  }
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { parseArgs, validateWeek, validateBacklog, resolveDestination, readHistory, createBrief, run };
