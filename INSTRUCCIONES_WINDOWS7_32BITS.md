# INSTRUCCIONES PARA WINDOWS 7 DE 32 BITS

## ⚠️ IMPORTANTE: Compatibilidad con Node.js 12.22.12

Este sistema está diseñado para funcionar en **Windows 7 de 32 bits con Node.js 12.22.12**.

---

## 📋 Requisitos en Windows 7 32-bits

- Node.js 12.22.12 (32-bit)
- NPM 6.x (incluido con Node 12)

---

## 🚀 PASOS PARA EJECUTAR EL SISTEMA

### 1. Instalar dependencias del BACKEND únicamente

```bash
npm install --production
```

**NOTA:** NO instales las dependencias del frontend en Windows 7. El frontend ya está pre-compilado en `frontend/dist/`.

---

### 2. Iniciar el servidor

```bash
npm start
```

O directamente:

```bash
node backend/server.js
```

---

### 3. Acceder al sistema

Abre tu navegador y ve a:

```
http://localhost:3000
```

**Credenciales por defecto:**
- Usuario: `admin`
- Contraseña: `admin123`

O:
- Usuario: `vendedor1`
- Contraseña: `1234`

---

## 🔧 IMPORTANTE: El frontend ya está compilado

El directorio `frontend/dist/` contiene la aplicación Vue.js **ya compilada** y lista para servir.

**NO necesitas:**
- ❌ Instalar dependencias del frontend (`cd frontend && npm install`)
- ❌ Compilar el frontend (`npm run build`)
- ❌ Tener Vite instalado

El servidor backend (Express) automáticamente sirve los archivos estáticos desde `frontend/dist/`.

---

## 🐛 Solución de Problemas

### Error: "Usuario y contraseña son requeridos"

**Causa:** El frontend antiguo (HTML estático) está en caché del navegador.

**Solución:**
1. Presiona `Ctrl + Shift + Delete` en tu navegador
2. Borra el caché y cookies
3. Cierra completamente el navegador
4. Vuelve a abrir y accede a `http://localhost:3000`

### Error al iniciar: "Cannot find module"

**Solución:**
```bash
npm install --production
```

### Base de datos no se crea

La base de datos SQLite se crea automáticamente en la primera ejecución en:
```
database/ferreteria.db
```

Si hay problemas:
```bash
node scripts/init-database.js
```

---

## 📦 Estructura del Proyecto

```
ferreteria/
├── backend/           # Código del servidor (Node.js + Express)
├── frontend/
│   ├── dist/         # ⭐ Frontend compilado (USAR ESTE)
│   └── src/          # Código fuente Vue (solo para desarrollo)
├── database/         # Base de datos SQLite
└── uploads/          # Imágenes de productos
```

---

## ✅ Verificación

Si todo está correcto, deberías ver:

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           FERRETERÍA POS - SISTEMA INICIADO              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

  🚀 Servidor: http://localhost:3000
  📊 API: http://localhost:3000/api
  🗄️  Base de datos: SQLite
  📁 Uploads: C:\...\uploads

  Presione CTRL+C para detener
```

---

## 💡 Desarrollo vs Producción

### En Windows 7 32-bits (PRODUCCIÓN):
- Usa Node.js 12.22.12
- Solo ejecuta el backend: `npm start`
- El frontend ya está compilado en `dist/`

### En máquina moderna (DESARROLLO):
- Usa Node.js 18+ para compilar frontend
- Compila con: `cd frontend && npm run build`
- Copia el `frontend/dist/` generado al proyecto

---

## 📞 Soporte

Usuario por defecto creado automáticamente:
- **admin** / **admin123** (Administrador ROOT)
- **vendedor1** / **1234** (Vendedor)
