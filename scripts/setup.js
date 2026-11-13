const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync  } = require('child_process');

const __dirname = __dirname || path.dirname(require.main.filename);

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║          FERRETERÍA POS - CONFIGURACIÓN INICIAL          ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Check .env file
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env...');

  let envContent = fs.readFileSync(envExamplePath, 'utf-8');

  // Generate random JWT secret
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  envContent = envContent.replace(
    'JWT_SECRET=CAMBIAR_ESTE_SECRET_EN_PRODUCCION_usar_cadena_aleatoria_larga',
    `JWT_SECRET=${jwtSecret}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('✓ Archivo .env creado con JWT_SECRET generado\n');
} else {
  console.log('✓ Archivo .env ya existe\n');
}

// Create database directory
const dbDir = path.join(__dirname, '..', 'database');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('✓ Directorio database/ creado\n');
}

// Create backups directory
const backupsDir = path.join(dbDir, 'backups');
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
  console.log('✓ Directorio database/backups/ creado\n');
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✓ Directorio logs/ creado\n');
}

// Initialize database
console.log('🗄️  Inicializando base de datos...\n');
try {
  execSync('node scripts/init-database.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (error) {
  console.error('❌ Error al inicializar la base de datos:', error.message);
  process.exit(1);
}

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║            ✓ CONFIGURACIÓN COMPLETADA                     ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

console.log('🔐 CREDENCIALES POR DEFECTO:');
console.log('   ──────────────────────────────');
console.log('   Administrador:');
console.log('   Usuario: admin');
console.log('   Contraseña: admin123');
console.log('');
console.log('   Vendedor:');
console.log('   Usuario: vendedor1');
console.log('   Contraseña: 1234');
console.log('   ──────────────────────────────\n');

console.log('🚀 PARA INICIAR EL SISTEMA:');
console.log('   1. Ejecute: npm start');
console.log('   2. Abra su navegador en: http://localhost:3000');
console.log('');
console.log('   O use el acceso directo: start_pos.vbs\n');

console.log('⚠️  IMPORTANTE:');
console.log('   Cambie las contraseñas por defecto después del primer acceso\n');
