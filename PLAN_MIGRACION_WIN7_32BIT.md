# Plan de Migración a Windows 7 32-bits
## Opción A + C Híbrida

**Objetivo**: Hacer el sistema compatible con Windows 7 32-bits sin perder datos, usando Node.js v12 + SQLite3 + Electron v11 + pkg

---

## 📋 FASES DEL PLAN

### FASE 1: Backup y Preparación
- [ ] Backup completo de `database/ferreteria.db`
- [ ] Backup de `frontend/dist/` si existe
- [ ] Crear rama de git para esta migración
- [ ] Documentar estado actual

### FASE 2: Cambiar Dependencias Backend
- [ ] Reemplazar `better-sqlite3` → `sqlite3` v5.x
- [ ] Actualizar `backend/config/database.js` para usar sqlite3
- [ ] Ajustar llamadas a BD en todos los controllers
- [ ] Testear que la BD sigue funcionando
- [ ] Actualizar `package.json` para Node.js v12+

### FASE 3: Compilar Frontend
- [ ] Bajar versiones de Vite si es necesario (compatible con Node v12)
- [ ] Compilar frontend: `npm run build`
- [ ] Verificar `frontend/dist/` genera correctamente
- [ ] Servir frontend desde backend (ya está en server.js)

### FASE 4: Scripts de Inicio Win7-Compatible
- [ ] Crear `start_pos_win7.bat` (batch nativo, sin .vbs)
- [ ] Crear `stop_pos.bat` mejorado
- [ ] Testear en terminal
- [ ] Agregar logs de inicio

### FASE 5: Empaquetamiento con pkg
- [ ] Instalar `pkg` globalmente
- [ ] Crear configuración de pkg
- [ ] Generar `.exe` standalone de 32-bits
- [ ] Testear el `.exe` sin Node.js instalado
- [ ] Incluir logo y metadata del sistema

### FASE 6: Verificación Final
- [ ] Probar en máquina sin Node.js
- [ ] Verificar que la BD se crea correctamente
- [ ] Probar login y operaciones básicas
- [ ] Validar que los datos persisten
- [ ] Crear manual de usuario para Win7

---

## 🎯 RESULTADO ESPERADO

**Entregables**:
- `ferreteria-app.exe` (32-bits, Win7 compatible)
- `start_pos_win7.bat` para iniciar fácilmente
- Datos persistentes en `database/ferreteria.db`
- No requiere Node.js instalado

**Tamaño esperado**: ~150-200MB (comprimido: ~60MB)

---

## ⚡ CAMBIOS TÉCNICOS PRINCIPALES

### 1. better-sqlite3 → sqlite3
```javascript
// ANTES
import Database from 'better-sqlite3';
const db = new Database(DB_PATH);
const result = db.prepare(sql).get();

// DESPUÉS
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(DB_PATH);
db.get(sql, (err, row) => { ... });
```

### 2. Node.js versión
- Cambiar de v22 LTS → v12 LTS
- Verificar compatibilidad de dependencias

### 3. Estructura de carpetas para pkg
```
ferreteria/
├── dist/              (EXE empaquetado)
├── database/          (BD en carpeta local)
├── backend/
├── frontend/
└── package.json
```

---

## 🚀 COMENZAR

Siguiente paso: **FASE 1 - Backup**

