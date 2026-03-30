/**
 * Invariant:
 * - Prod promotion fast path must only apply to a true fast-forward of the already-tested staging SHA.
 * Why this exists:
 * - Prevents the optimized prod push path from becoming a loophole for untested commits.
 * What breaks if it fails:
 * - Local release pushes could skip the heavyweight gate for unsafe prod commits.
 */
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const {
  assertFastForwardPromotionShape
} = require(path.join(ROOT, 'scripts', 'qa', 'verify-prod-promotion-candidate.js'));

describe('prod promotion candidate guardrail', () => {
  test('accepts a prod branch commit that matches staging sha', () => {
    expect(() =>
      assertFastForwardPromotionShape({
        currentBranch: 'prod',
        headSha: 'abc123',
        stagingSha: 'abc123',
        prodSha: 'def456'
      }, { fastForwardCheck: () => true })
    ).not.toThrow();
  });

  test('rejects non-prod branches', () => {
    expect(() =>
      assertFastForwardPromotionShape({
        currentBranch: 'staging',
        headSha: 'abc123',
        stagingSha: 'abc123',
        prodSha: 'def456'
      }, { fastForwardCheck: () => true })
    ).toThrow(/prod/i);
  });

  test('rejects commits that do not match staging', () => {
    expect(() =>
      assertFastForwardPromotionShape({
        currentBranch: 'prod',
        headSha: 'abc123',
        stagingSha: 'zzz999',
        prodSha: 'def456'
      }, { fastForwardCheck: () => true })
    ).toThrow(/does not match origin\/staging/i);
  });

  test('rejects non fast-forward prod pushes', () => {
    expect(() =>
      assertFastForwardPromotionShape({
        currentBranch: 'prod',
        headSha: 'abc123',
        stagingSha: 'abc123',
        prodSha: 'def456'
      }, { fastForwardCheck: () => { throw new Error('nope'); } })
    ).toThrow(/fast-forward/i);
  });
});
