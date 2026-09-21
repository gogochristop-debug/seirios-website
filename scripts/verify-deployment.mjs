import { readFile, readdir } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';

const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
const repositoryRoot = resolve('.');
const assetDirectory = resolve(config.assets?.directory ?? '.');
const productionDirectory = resolve('dist');

if (config.assets?.directory !== './dist' || assetDirectory !== productionDirectory) {
  throw new Error('Cloudflare assets.directory must be ./dist');
}

if (assetDirectory === repositoryRoot) {
  throw new Error('Refusing to deploy the repository root');
}

const allowedEntries = new Set(['favicon.svg', 'index.html', 'logo.svg', 'src']);
const outputEntries = await readdir(productionDirectory);
const unexpectedEntries = outputEntries.filter((entry) => !allowedEntries.has(entry));

if (unexpectedEntries.length > 0) {
  throw new Error(`Unexpected deployment assets: ${unexpectedEntries.join(', ')}`);
}

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : path;
  }))).flat();
}

const deployedFiles = await listFiles(productionDirectory);
const forbiddenFiles = deployedFiles
  .map((file) => relative(productionDirectory, file))
  .filter((file) => file.split(sep).includes('node_modules'));

if (forbiddenFiles.length > 0) {
  throw new Error(`node_modules must never be deployed: ${forbiddenFiles.join(', ')}`);
}

console.log('Cloudflare deployment is restricted to the verified dist/ output.');
