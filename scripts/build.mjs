import { cp, mkdir, readdir, rm } from 'node:fs/promises';

const output = new URL('../dist/', import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
const root = new URL('../', import.meta.url);
for (const file of await readdir(root)) {
  if (file.endsWith('.html')) await cp(new URL(file, root), new URL(file, output));
}
await cp(new URL('../src/', import.meta.url), new URL('src/', output), { recursive: true });
await cp(new URL('../public/', import.meta.url), output, { recursive: true });
console.log('Static production build created in dist/');
