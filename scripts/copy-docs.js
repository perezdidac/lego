import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve('dist');
const docsDir = path.resolve('docs');

if (fs.existsSync(distDir)) {
  if (fs.existsSync(docsDir)) {
    fs.rmSync(docsDir, { recursive: true, force: true });
  }
  fs.cpSync(distDir, docsDir, { recursive: true });
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(docsDir, '404.html'));
  console.log('✓ Successfully mirrored dist/ to docs/ and created 404.html');
}
