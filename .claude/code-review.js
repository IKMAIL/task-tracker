#!/usr/bin/env node
/**
 * code-review.js — Stop hook
 * Runs after Claude completes changes. Gets git diff and passes to
 * Claude CLI for a technical code review. Rewakes Claude with findings.
 */

const { execSync, execFileSync } = require('child_process');

// Only review source files — skip config, json, markdown, etc.
const SOURCE_PATTERN = /\.(ts|tsx|js|jsx|mjs|cjs|py|go|java|cs|cpp|c|rb|rs|php)$/;

function getDiff() {
  // Suppress git's stderr (e.g. CRLF warnings) with stdio pipe
  const opts = { encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'ignore'] };
  for (const cmd of ['git diff HEAD', 'git diff --staged']) {
    try {
      const raw = execSync(cmd, opts).trim();
      if (!raw) continue;

      // Filter diff blocks to source files only
      const filtered = raw
        .split(/^(?=diff --git )/m)
        .filter((block) => SOURCE_PATTERN.test(block.split('\n')[0]))
        .join('');

      if (filtered.trim()) return filtered;
    } catch {
      // ignore
    }
  }
  return '';
}

async function main() {
  const diff = getDiff();

  // Nothing changed — skip
  if (!diff) {
    process.exit(0);
  }

  const prompt =
    'You are a senior code reviewer. Review the following git diff. ' +
    'Focus only on: bugs, security vulnerabilities, critical logic errors, ' +
    'and major code smells. Ignore style/formatting. ' +
    'If no critical issues exist, respond with exactly: "No critical issues found." ' +
    'Otherwise list each issue briefly with file + line where applicable.';

  let review = '';
  try {
    review = execFileSync('claude', ['-p', prompt], {
      input: diff,
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024,
    }).trim();
  } catch {
    // Claude CLI failed — silently exit without blocking
    process.exit(0);
  }

  if (!review || review === 'No critical issues found.') {
    process.exit(0);
  }

  // Exit 2 rewakes Claude with this output as context
  process.stdout.write(
    JSON.stringify({ systemMessage: `Code Review:\n\n${review}` })
  );
  process.exit(2);
}

main().catch(() => process.exit(0));
