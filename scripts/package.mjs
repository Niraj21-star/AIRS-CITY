import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('outputs', { recursive: true });
await copyFile('dist/index.html', 'outputs/airs-city.html');
console.log('Packaged outputs/airs-city.html');
