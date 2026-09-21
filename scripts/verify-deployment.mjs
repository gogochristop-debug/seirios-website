import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
if (config.assets?.directory !== './dist') {
  throw new Error('Cloudflare assets.directory must be ./dist');
}

const allowedEntries = new Set(['favicon.svg', 'index.html', 'logo.svg', 'src']);
const outputEntries = await readdir(resolve('dist'));
const unexpectedEntries = outputEntries.filter((entry) => !allowedEntries.has(entry));

if (unexpectedEntries.length > 0) {
  throw new Error(`Unexpected deployment assets: ${unexpectedEntries.join(', ')}`);
}

console.log('Cloudflare deployment is restricted to the verified dist/ output.');
