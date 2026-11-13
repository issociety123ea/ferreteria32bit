const fs = require('fs');
const path = require('path');

function convertESModulesToCommonJS(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Handle import statements
  // import X from 'Y' -> const X = require('Y')
  content = content.replace(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, "const $1 = require('$2')");

  // import * as X from 'Y' -> const X = require('Y')
  content = content.replace(/import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g, "const $1 = require('$2')");

  // import { X, Y, Z } from 'Y' -> const { X, Y, Z } = require('Y')
  content = content.replace(/import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]([^'"]+)['"]/g, "const { $1 } = require('$2')");

  // Handle export default X -> module.exports = X
  content = content.replace(/export\s+default\s+(\w+)/g, "module.exports = $1");

  // Handle export const X = ... -> remove 'export' keyword, keep const X = ...
  content = content.replace(/export\s+(const|let|var|function|class)\s+/g, "$1 ");

  // Handle export { X } or export { X, Y } -> module.exports = { X, Y }
  content = content.replace(/export\s+\{\s*([^}]+)\s*\}/g, (match, exports) => {
    const items = exports.split(',').map(item => item.trim());
    return "module.exports = { " + items.join(', ') + " }";
  });

  // Handle fileURLToPath and import.meta.url for __dirname/__filename
  // These need to be handled only if they're still present after conversion
  if (content.includes('import.meta.url')) {
    content = content.replace(/const __filename = fileURLToPath\(import\.meta\.url\);/g,
      "const __filename = __filename || module.filename;");
    content = content.replace(/import { fileURLToPath } from ['"]url['"]/g, "");
  }

  // Remove any remaining import.meta.url references since we're using __dirname and __filename
  // Replace path.dirname(fileURLToPath(import.meta.url)) with __dirname approach
  if (content.includes('fileURLToPath(import.meta.url)')) {
    // If using fileURLToPath pattern, we need path module
    if (!content.includes("require('path')")) {
      content = "const path = require('path');\n" + content;
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Convertido: ${filePath}`);
}

function getAllJSFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist directories
      if (!file.includes('node_modules') && !file.includes('dist')) {
        getAllJSFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const backendDir = 'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend';
const scriptsDir = 'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\scripts';

console.log('Iniciando conversión de ES Modules a CommonJS...\n');

const backendFiles = getAllJSFiles(backendDir);
const scriptFiles = getAllJSFiles(scriptsDir);

const allFiles = [...backendFiles, ...scriptFiles];

allFiles.forEach(file => {
  convertESModulesToCommonJS(file);
});

console.log(`\n✓ Conversión completada. ${allFiles.length} archivos modificados.`);
