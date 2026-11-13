const sqlite3 = require('sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', '..', 'database', 'ferreteria.db');
const SCHEMA_PATH = path.join(__dirname, '..', '..', 'database', 'schema.sql');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection with verbose mode
const dbConnection = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('[DB] Error al conectar:', err);
  } else {
    console.log('[DB] Conectado a SQLite3');
  }
});

// Performance optimizations & Schema initialization
dbConnection.configure('busyTimeout', 5000);
dbConnection.serialize(() => {
  dbConnection.run('PRAGMA journal_mode = WAL');
  dbConnection.run('PRAGMA synchronous = NORMAL');
  dbConnection.run('PRAGMA cache_size = -64000');
  dbConnection.run('PRAGMA foreign_keys = ON');
  dbConnection.run('PRAGMA temp_store = MEMORY');

  // Check if usuarios table exists
  dbConnection.get("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'", (err, row) => {
    if (err) {
      console.error('[DB] Error al verificar tablas:', err);
      return;
    }

    if (!row) {
      console.log('[DB] Inicializando base de datos completa...');
      try {
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');

        dbConnection.exec(schema, (err) => {
          if (err) {
            console.error('[DB] Error crítico al crear esquema:', err.message);
          } else {
            console.log('[DB] Tablas y triggers creados exitosamente.');

            // Insertar usuario administrador por defecto (admin / admin123)
            const bcrypt = require('bcryptjs');
            const adminHash = bcrypt.hashSync('admin123', 10);
            const vendHash = bcrypt.hashSync('1234', 10);

            dbConnection.run(`
              INSERT OR IGNORE INTO usuarios (id, nombre, username, password_hash, rol)
              VALUES (1, 'Administrador', 'admin', ?, 'ROOT')
            `, [adminHash]);

            dbConnection.run(`
              INSERT OR IGNORE INTO usuarios (id, nombre, username, password_hash, rol)
              VALUES (2, 'Vendedor 1', 'vendedor1', ?, 'VENDEDOR')
            `, [vendHash], (err) => {
              if (!err) {
                console.log('[DB] Usuarios por defecto creados (admin / admin123).');
              }
            });
          }
        });
      } catch (e) {
        console.error('[DB] Error al leer schema.sql:', e);
      }
    }
  });
});

// Compatibility wrapper to emulate better-sqlite3 API
class PreparedStatement {
  constructor(sql, db) {
    this.sql = sql;
    this.db = db;
  }

  get(...params) {
    return new Promise((resolve, reject) => {
      this.db.get(this.sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(...params) {
    return new Promise((resolve, reject) => {
      this.db.all(this.sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  run(...params) {
    return new Promise((resolve, reject) => {
      this.db.run(this.sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }
}

class DatabaseWrapper {
  constructor(connection) {
    this.connection = connection;
  }

  prepare(sql) {
    return new PreparedStatement(sql, this.connection);
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.connection.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  pragma(pragma) {
    return new Promise((resolve, reject) => {
      this.connection.all(`PRAGMA ${pragma}`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.connection.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

const db = new DatabaseWrapper(dbConnection);

module.exports = db;
