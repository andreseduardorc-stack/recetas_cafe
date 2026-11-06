import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const docsDir = path.join(rootDir, 'docs');

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (fs.existsSync(distDir)) {
  // Clean docs/assets first so old bundle hashes don't accumulate
  const docsAssetsDir = path.join(docsDir, 'assets');
  if (fs.existsSync(docsAssetsDir)) {
    fs.rmSync(docsAssetsDir, { recursive: true, force: true });
  }

  copyDirSync(distDir, docsDir);
  console.log('✅ Archivos de producción copiados con éxito a la carpeta /docs');
} else {
  console.error('❌ La carpeta dist no existe. Ejecuta vite build primero.');
}
