import fs from 'node:fs';
import path from 'node:path';
import archiver from 'archiver';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const dist = path.join(rootDir, 'dist');

async function build() {
  try {
    console.log('🧹 Limpando pasta dist...');
    fs.rmSync(dist, { recursive: true, force: true });
    fs.mkdirSync(dist, { recursive: true });

    console.log('📦 Copiando arquivos da extensão...');

    // Copia arquivos essenciais
    const filesToCopy = ['manifest.json'];
    for (const f of filesToCopy) {
      const source = path.join(rootDir, f);
      const dest = path.join(dist, f);
      if (fs.existsSync(source)) {
        fs.copyFileSync(source, dest);
        console.log(`  ✓ ${f}`);
      } else {
        console.warn(`  ⚠ ${f} não encontrado`);
      }
    }

    // Copia pastas recursivamente
    function copyFolderRecursive(source, target) {
      if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
      }

      const files = fs.readdirSync(source);

      for (const file of files) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        const stat = fs.statSync(sourcePath);

        if (stat.isDirectory()) {
          copyFolderRecursive(sourcePath, targetPath);
        } else {
          fs.copyFileSync(sourcePath, targetPath);
        }
      }
    }

    const foldersToCopy = ['src', 'icons'];
    for (const folder of foldersToCopy) {
      const source = path.join(rootDir, folder);
      const dest = path.join(dist, folder);
      if (fs.existsSync(source)) {
        copyFolderRecursive(source, dest);
        console.log(`  ✓ ${folder}/`);
      } else {
        console.warn(`  ⚠ ${folder}/ não encontrado`);
      }
    }

    console.log('🗜️  Gerando ZIP...');

    // Gera ZIP
    const zipPath = path.join(dist, 'extension.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Promisify o processo de zip
    await new Promise((resolve, reject) => {
      output.on('close', () => {
        const size = (archive.pointer() / 1024).toFixed(2);
        console.log(`✅ Build completo!`);
        console.log(`   📁 Pasta: ${dist}`);
        console.log(`   📦 ZIP: extension.zip (${size} KB)`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Adiciona todos os arquivos da pasta dist (exceto o próprio zip)
      archive.directory(dist, false, (entry) => {
        if (entry.name === 'extension.zip') return false;
        return entry;
      });

      archive.finalize();
    });
  } catch (error) {
    console.error('❌ Erro no build:', error);
    process.exit(1);
  }
}

build();
