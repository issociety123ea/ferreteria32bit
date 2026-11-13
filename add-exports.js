const fs = require('fs');
const path = require('path');

function extractFunctionNames(content) {
  const functionNames = [];

  // Match: const functionName = async (req, res) => {
  // and: const functionName = (req, res) => {
  const regex = /const\s+(\w+)\s*=\s*(?:async\s*)?\(/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    functionNames.push(match[1]);
  }

  return functionNames;
}

function addModuleExports(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if module.exports already exists
  if (content.includes('module.exports')) {
    console.log(`✓ ${filePath} ya tiene module.exports`);
    return;
  }

  const functionNames = extractFunctionNames(content);

  if (functionNames.length === 0) {
    console.log(`⚠ ${filePath} no tiene funciones`);
    return;
  }

  const exportLine = `module.exports = { ${functionNames.join(', ')} };`;
  content += '\n\n' + exportLine;

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✓ Agregado module.exports a ${filePath}: ${functionNames.join(', ')}`);
}

// Controllers
const controllerFiles = [
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\categorias.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\clientes.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\compras.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\kardex.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\productos.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\proveedores.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\reportes.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\usuarios.controller.js',
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\controllers\\ventas.controller.js'
];

console.log('Agregando module.exports a controladores...\n');
controllerFiles.forEach(file => {
  if (fs.existsSync(file)) {
    addModuleExports(file);
  }
});

// Routes
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

console.log('\nVerificando rutas...\n');
routeFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('module.exports')) {
      console.log(`✓ ${file} ya tiene module.exports`);
    } else {
      console.log(`⚠ ${file} no tiene module.exports`);
    }
  }
});

// Middleware
const middlewareFiles = [
  'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\middleware\\upload.js'
];

console.log('\nVerificando middleware...\n');
middlewareFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf-8');
    if (content.includes('module.exports')) {
      console.log(`✓ ${file} ya tiene module.exports`);
    } else {
      console.log(`⚠ ${file} no tiene module.exports`);
      addModuleExports(file);
    }
  }
});

console.log('\n✓ Completado');
