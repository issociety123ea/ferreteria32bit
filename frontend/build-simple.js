#!/usr/bin/env node
/**
 * Script simple para compilar frontend sin Vite
 * Compatible con Node.js 12
 *
 * Copia archivos necesarios a la carpeta dist/
 * No usa ES modules, solo CommonJS
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const srcDir = path.join(__dirname, 'src');

// Crear directorio dist
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
  console.log('Creado: dist/');
}

// HTML simple
const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ferretería POS</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f3f4f6;
      color: #1f2937;
    }
    #app {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      text-align: center;
      max-width: 400px;
      width: 90%;
    }
    h1 {
      margin-bottom: 20px;
      color: #667eea;
    }
    p {
      margin-bottom: 10px;
      color: #6b7280;
    }
    .status {
      margin-top: 20px;
      padding: 15px;
      background: #f0fdf4;
      border: 1px solid #86efac;
      border-radius: 5px;
      color: #166534;
    }
    .error {
      background: #fef2f2;
      border-color: #fca5a5;
      color: #991b1b;
    }
  </style>
</head>
<body>
  <div id="app">
    <div class="container">
      <h1>Ferretería POS</h1>
      <p>Sistema en desarrollo</p>
      <div class="status" id="status">
        Conectando al servidor...
      </div>
    </div>
  </div>
  <script>
    // Verificar conexión al servidor
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        document.getElementById('status').innerHTML = '✓ Conectado al servidor<br>Sistema listo';
        document.getElementById('status').className = 'status';
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          window.location.href = '/login.html';
        }, 2000);
      })
      .catch(err => {
        document.getElementById('status').innerHTML = '✗ Error: No se puede conectar al servidor<br>' + err.message;
        document.getElementById('status').className = 'status error';
      });
  </script>
</body>
</html>`;

// Login simple HTML
const loginHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - Ferretería POS</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .login-container {
      background: white;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #667eea;
      font-size: 28px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #374151;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d1d5db;
      border-radius: 5px;
      font-size: 14px;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    button {
      width: 100%;
      padding: 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 10px;
    }
    button:hover {
      background: #5568d3;
    }
    .info {
      margin-top: 20px;
      padding: 15px;
      background: #f0f9ff;
      border-left: 4px solid #667eea;
      border-radius: 3px;
      font-size: 13px;
      color: #1e40af;
    }
    .error {
      color: #dc2626;
      margin-top: 10px;
      display: none;
    }
    .loading {
      display: none;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="login-container">
    <h1>Ferretería POS</h1>

    <form id="loginForm">
      <div class="form-group">
        <label for="usuario">Usuario</label>
        <input type="text" id="usuario" name="usuario" required>
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" name="password" required>
      </div>

      <button type="submit">Iniciar Sesión</button>

      <div class="error" id="error"></div>
      <div class="loading" id="loading">Verificando...</div>
    </form>

    <div class="info">
      <strong>Credenciales de prueba:</strong><br>
      Usuario: admin<br>
      Contraseña: admin123
    </div>
  </div>

  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();

      const usuario = document.getElementById('usuario').value;
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');
      const loadingDiv = document.getElementById('loading');

      errorDiv.style.display = 'none';
      loadingDiv.style.display = 'block';

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ usuario, password })
        });

        const data = await res.json();

        if (data.success) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/dashboard.html';
        } else {
          errorDiv.textContent = data.message || 'Error al iniciar sesión';
          errorDiv.style.display = 'block';
          loadingDiv.style.display = 'none';
        }
      } catch (err) {
        errorDiv.textContent = 'Error: ' + err.message;
        errorDiv.style.display = 'block';
        loadingDiv.style.display = 'none';
      }
    });
  </script>
</body>
</html>`;

// Dashboard simple HTML
const dashboardHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - Ferretería POS</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 {
      color: #667eea;
    }
    button {
      padding: 8px 16px;
      background: #ef4444;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    button:hover {
      background: #dc2626;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .card {
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center;
    }
    .card h2 {
      color: #667eea;
      font-size: 24px;
      margin-bottom: 10px;
    }
    .card p {
      color: #6b7280;
      font-size: 14px;
    }
    .card a {
      display: inline-block;
      margin-top: 15px;
      padding: 10px 20px;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background 0.2s;
    }
    .card a:hover {
      background: #5568d3;
    }
    .user-info {
      color: #6b7280;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>Ferretería POS</h1>
        <p class="user-info" id="userInfo">Usuario: <span id="username">cargando...</span></p>
      </div>
      <button onclick="logout()">Cerrar Sesión</button>
    </header>

    <div class="dashboard-grid">
      <div class="card">
        <h2>POS</h2>
        <p>Sistema de punto de venta</p>
        <a href="/pos.html">Abrir POS</a>
      </div>

      <div class="card">
        <h2>Inventario</h2>
        <p>Gestión de productos</p>
        <a href="/inventory.html">Ver Inventario</a>
      </div>

      <div class="card">
        <h2>Clientes</h2>
        <p>Registro de clientes</p>
        <a href="/clientes.html">Ver Clientes</a>
      </div>

      <div class="card">
        <h2>Reportes</h2>
        <p>Análisis y estadísticas</p>
        <a href="/reportes.html">Ver Reportes</a>
      </div>
    </div>
  </div>

  <script>
    // Verificar autenticación
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
      window.location.href = '/login.html';
    } else {
      document.getElementById('username').textContent = user.usuario || 'Usuario';
    }

    function logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login.html';
    }
  </script>
</body>
</html>`;

// POS simple HTML
const posHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>POS - Ferretería</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: white;
      padding: 15px 20px;
      border-radius: 5px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
    .pos-grid {
      display: grid;
      grid-template-columns: 1fr 350px;
      gap: 20px;
    }
    .productos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
    }
    .producto {
      background: white;
      padding: 15px;
      border-radius: 5px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .producto:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .carrito {
      background: white;
      padding: 20px;
      border-radius: 5px;
    }
    .carrito h2 {
      margin-bottom: 15px;
      color: #667eea;
    }
    .item-carrito {
      padding: 10px;
      background: #f3f4f6;
      margin-bottom: 10px;
      border-radius: 3px;
      display: flex;
      justify-content: space-between;
    }
    .total {
      font-size: 20px;
      font-weight: bold;
      color: #667eea;
      margin-top: 15px;
      padding: 15px;
      background: #f0f9ff;
      border-radius: 5px;
      text-align: right;
    }
    button {
      width: 100%;
      padding: 10px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin-top: 10px;
      font-weight: 600;
    }
    button:hover {
      background: #5568d3;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Sistema POS</h1>
      <a href="/dashboard.html" style="text-decoration: none; color: #667eea;">← Volver</a>
    </header>

    <div class="pos-grid">
      <div class="productos" id="productos"></div>
      <div class="carrito">
        <h2>Carrito</h2>
        <div id="items"></div>
        <div class="total">Total: $<span id="total">0.00</span></div>
        <button onclick="cobrar()">Cobrar</button>
      </div>
    </div>
  </div>

  <script>
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    if (!usuario.id) window.location.href = '/login.html';

    let carrito = [];

    // Cargar productos
    fetch('/api/productos')
      .then(r => r.json())
      .then(data => {
        const container = document.getElementById('productos');
        (data.data || []).forEach(p => {
          const div = document.createElement('div');
          div.className = 'producto';
          div.innerHTML = `<strong>${p.nombre}</strong><br>$${p.precio}`;
          div.onclick = () => agregarCarrito(p);
          container.appendChild(div);
        });
      });

    function agregarCarrito(producto) {
      const item = carrito.find(i => i.id === producto.id);
      if (item) {
        item.cantidad++;
      } else {
        carrito.push({...producto, cantidad: 1});
      }
      actualizarCarrito();
    }

    function actualizarCarrito() {
      const html = carrito.map(i =>
        \`<div class="item-carrito"><span>\${i.nombre} x\${i.cantidad}</span><span>$\${(i.precio * i.cantidad).toFixed(2)}</span></div>\`
      ).join('');
      document.getElementById('items').innerHTML = html;

      const total = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);
      document.getElementById('total').textContent = total.toFixed(2);
    }

    function cobrar() {
      if (carrito.length === 0) {
        alert('Carrito vacío');
        return;
      }
      alert('Venta registrada');
      carrito = [];
      actualizarCarrito();
    }
  </script>
</body>
</html>`;

// Inventory simple HTML
const inventoryHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inventario - Ferretería</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f3f4f6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header {
      background: white;
      padding: 20px;
      border-radius: 10px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
    table {
      width: 100%;
      background: white;
      border-collapse: collapse;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    th {
      background: #667eea;
      color: white;
      padding: 15px;
      text-align: left;
    }
    td {
      padding: 12px 15px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:hover {
      background: #f9fafb;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Inventario</h1>
      <a href="/dashboard.html" style="text-decoration: none; color: #667eea;">← Volver</a>
    </header>

    <table id="tabla">
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Stock</th>
          <th>Precio</th>
          <th>Costo</th>
        </tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>

  <script>
    const usuario = JSON.parse(localStorage.getItem('user') || '{}');
    if (!usuario.id) window.location.href = '/login.html';

    fetch('/api/productos')
      .then(r => r.json())
      .then(data => {
        const tbody = document.getElementById('tbody');
        (data.data || []).forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = \`
            <td>\${p.nombre}</td>
            <td>\${p.categoria || 'N/A'}</td>
            <td>\${p.stock}</td>
            <td>$\${p.precio}</td>
            <td>$\${p.costo || 'N/A'}</td>
          \`;
          tbody.appendChild(tr);
        });
      });
  </script>
</body>
</html>`;

// Escribir archivos
fs.writeFileSync(path.join(distDir, 'index.html'), html);
console.log('Creado: dist/index.html');

fs.writeFileSync(path.join(distDir, 'login.html'), loginHtml);
console.log('Creado: dist/login.html');

fs.writeFileSync(path.join(distDir, 'dashboard.html'), dashboardHtml);
console.log('Creado: dist/dashboard.html');

fs.writeFileSync(path.join(distDir, 'pos.html'), posHtml);
console.log('Creado: dist/pos.html');

fs.writeFileSync(path.join(distDir, 'inventory.html'), inventoryHtml);
console.log('Creado: dist/inventory.html');

console.log('');
console.log('✓ Frontend compilado exitosamente');
console.log('✓ No se requiere Node.js moderno');
console.log('✓ Compatible con Node.js 12.22.12');
