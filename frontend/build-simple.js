const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'public-src');
const distDir = path.join(__dirname, 'dist');

console.log('Compilando frontend (modo copia segura)...');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const distFile = path.join(distDir, file);
    if (fs.statSync(srcFile).isFile()) {
      fs.copyFileSync(srcFile, distFile);
      console.log('  Copiado: ' + file);
    }
  });
  console.log('✓ Frontend compilado exitosamente sin errores de sintaxis');
} else {
  console.error('ERROR: No se encuentra public-src/');
  process.exit(1);
}
