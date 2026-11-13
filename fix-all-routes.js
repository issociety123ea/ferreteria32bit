const fs = require('fs');
const path = require('path');

function fixAllRoutes() {
  const routesDir = 'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend\\routes';
  const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.routes.js'));

  files.forEach(file => {
    const filePath = path.join(routesDir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Skip if already using destructuring for controller
    if (content.match(/const\s*\{\s*\w+.*\}\s*=\s*require\(['"]\.\.\/controllers/)) {
      console.log(`✓ ${file} already uses destructuring`);
      return;
    }

    // Find controller require
    const controllerMatch = content.match(/const\s+(\w+)\s*=\s*require\(['"]\.\.\/controllers\/(\w+\.controller)\.js['"]\);/);

    if (!controllerMatch) {
      console.log(`⚠ No controller require found in ${file}`);
      return;
    }

    const varName = controllerMatch[1];
    const controllerName = controllerMatch[2];
    const controllerPath = path.join(routesDir, '..', 'controllers', controllerName + '.js');

    if (!fs.existsSync(controllerPath)) {
      console.log(`⚠ Controller not found: ${controllerPath}`);
      return;
    }

    const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
    const exportsMatch = controllerContent.match(/module\.exports\s*=\s*\{\s*([^}]+)\s*\}/);

    if (!exportsMatch) {
      console.log(`⚠ No exports in ${controllerName}`);
      return;
    }

    const exports = exportsMatch[1].split(',').map(e => e.trim());

    // Replace require
    const oldRequire = controllerMatch[0];
    const newRequire = `const { ${exports.join(', ')} } = require('../controllers/${controllerName}.js');`;
    content = content.replace(oldRequire, newRequire);

    // Replace all varName.method with method
    const regex = new RegExp(varName + '\\.(\\w+)', 'g');
    content = content.replace(regex, '$1');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed ${file}`);
  });
}

console.log('Corrigiendo todas las rutas...\n');
fixAllRoutes();
console.log('\n✓ Completado');
