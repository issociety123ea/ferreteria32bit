const fs = require('fs');
const path = require('path');

function validateConversion(dir, pattern = /\.js$/) {
  const issues = [];

  function checkDir(dirPath) {
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
      if (file.includes('node_modules') || file.includes('dist')) return;

      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        checkDir(filePath);
      } else if (pattern.test(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Check for ES Module syntax
        if (content.includes('import ') && !content.includes('// import')) {
          issues.push(`${filePath} - Still has 'import' statements`);
        }

        if (content.includes('export default') && !content.includes('// export')) {
          issues.push(`${filePath} - Still has 'export default' statements`);
        }

        if (content.includes('export {') && !content.includes('// export')) {
          issues.push(`${filePath} - Still has 'export {' statements`);
        }

        if (content.includes('export const') && !content.includes('// export')) {
          issues.push(`${filePath} - Still has 'export const' statements`);
        }

        if (content.includes('import.meta.url')) {
          issues.push(`${filePath} - Still has 'import.meta.url'`);
        }

        // Check for proper CommonJS syntax
        if (!content.includes('require(') && !content.includes('module.exports')) {
          // Only warn if file should have requires or exports
          if (content.length > 100 && !content.includes('console.log')) {
            // This is likely a config or small utility file
          }
        }
      }
    });
  }

  checkDir(dir);
  return issues;
}

const backendDir = 'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\backend';
const scriptsDir = 'C:\\Users\\User\\Desktop\\kkk\\ferreteria\\scripts';

console.log('Validando conversión ES Modules -> CommonJS...\n');

const backendIssues = validateConversion(backendDir);
const scriptsIssues = validateConversion(scriptsDir);

const allIssues = [...backendIssues, ...scriptsIssues];

if (allIssues.length === 0) {
  console.log('✓ Conversión completada correctamente');
  console.log('✓ No se encontraron restos de ES Modules');
} else {
  console.log(`❌ Se encontraron ${allIssues.length} problemas:\n`);
  allIssues.forEach(issue => {
    console.log(`  - ${issue}`);
  });
}

console.log('\n' + '='.repeat(60));
console.log('Listado de archivos convertidos:');
console.log('='.repeat(60) + '\n');

function listFiles(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (file.includes('node_modules') || file.includes('dist')) return;

    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      listFiles(filePath, prefix + '  ');
    } else if (/\.js$/.test(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const hasRequire = content.includes('require(');
      const hasExports = content.includes('module.exports');
      const status = (hasRequire || hasExports) ? '✓' : '○';
      console.log(`${status} ${prefix}${file}`);
    }
  });
}

console.log('Backend:');
listFiles(backendDir);

console.log('\nScripts:');
listFiles(scriptsDir);
