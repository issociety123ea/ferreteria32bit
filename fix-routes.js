const fs = require('fs');
const path = require('path');

function fixRoute(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Find the controller require line
  const controllerMatch = content.match(/const\s+(\w+)\s*=\s*require\(['"]\.\.\/controllers\/(\w+\.controller)\.js['"]\);/);

  if (!controllerMatch) {
    console.log(`⚠ No controller require found in ${filePath}`);
    return;
  }

  const varName = controllerMatch[1];
  const controllerName = controllerMatch[2];

  // If already using destructuring, skip
  if (content.includes(`const { `)) {
    console.log(`✓ ${filePath} already uses destructuring`);
    return;
  }

  // Replace controller require with destructuring import
  // We'll replace: const productosController = require(...)
  // With: const { getAll, ... } = require(...)

  // For now, we'll just change how it's used in the routes
  // Replace: productosController.methodName with just methodName

  const originalRequire = controllerMatch[0];

  // Extract controller file to see what functions it exports
  const controllerPath = path.join(path.dirname(filePath), '..', 'controllers', controllerName + '.js');

  if (!fs.existsSync(controllerPath)) {
    console.log(`⚠ Controller file not found: ${controllerPath}`);
    return;
  }

  const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
  const exportsMatch = controllerContent.match(/module\.exports\s*=\s*\{\s*([^}]+)\s*\}/);

  if (!exportsMatch) {
    console.log(`⚠ No exports found in ${controllerPath}`);
    return;
  }

  const exports = exportsMatch[1].split(',').map(e => e.trim());

  // Replace the require line with destructuring
  const newRequire = `const { ${exports.join(', ')} } = require('../controllers/${controllerName}.js');`;
  content = content.replace(originalRequire, newRequire);

  // Replace all productosController.method with just method
  const regex = new RegExp(varName + '\\.(\\w+)', 'g');
  content = content.replace(regex, '$1');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Fixed ${filePath}`);
}

const routeFiles = [
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\categorias.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\clientes.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\compras.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\kardex.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\productos.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\proveedores.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\reportes.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\usuarios.routes.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes\\ventas.routes.js'
];

console.log('Corrigiendo rutas para usar destructuración...\n');
routeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fixRoute(file);
  }
});

console.log('\n✓ Completado');
