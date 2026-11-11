import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'database', 'ferreteria.db');
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Performance optimizations
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000'); // 64MB cache
db.pragma('foreign_keys = ON');
db.pragma('temp_store = MEMORY');

// Initialize schema if tables don't exist
const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'").get();
if (!tableCheck) {
  console.log('[DB] Inicializando esquema de base de datos...');
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  db.exec(schema);
  console.log('[DB] Esquema creado exitosamente.');
}

export default db;
