#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

let input = '';
process.stdin.on('data', chunk => (input += chunk));
process.stdin.on('end', () => {
  let parsed;
  try {
    parsed = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  const filePath = parsed?.tool_input?.file_path;
  if (!filePath) process.exit(0);

  // Walk up to find nearest tsconfig.json
  let dir = path.dirname(path.resolve(filePath));
  while (true) {
    const tsconfigPath = path.join(dir, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        execSync('npx tsc --noEmit', { cwd: dir, stdio: 'pipe' });
      } catch (err) {
        const output = (err.stdout?.toString() || '') + (err.stderr?.toString() || '');
        process.stderr.write(`TSC errors in ${dir}:\n${output}\n`);
        process.exit(2);
      }
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break; // reached filesystem root
    dir = parent;
  }

  process.exit(0);
});
