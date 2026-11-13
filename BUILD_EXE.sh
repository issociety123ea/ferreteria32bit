#!/bin/bash
# Script para compilar ferreteria-app.exe para Windows 7 32-bits
# Este script prepara todo y genera el EXE standalone

set -e

echo "=========================================="
echo "COMPILANDO: Ferretería POS - EXE Win7 32bit"
echo "=========================================="
echo ""

# 1. Compilar frontend si no está compilado
if [ ! -d "frontend/dist" ]; then
  echo "📦 Compilando frontend..."
  cd frontend
  npm run build
  cd ..
  echo "✓ Frontend compilado"
  echo ""
fi

# 2. Instalar pkg globalmente si no está instalado
if ! command -v pkg &> /dev/null; then
  echo "📦 Instalando pkg..."
  npm install -g pkg
  echo "✓ pkg instalado"
  echo ""
fi

# 3. Crear carpeta de salida
mkdir -p dist

# 4. Compilar para Windows 7 32-bits
echo "🔨 Compilando EXE para Windows 7 32-bits..."
echo "   (esto puede tomar 2-5 minutos)"
echo ""

pkg \
  --target node18-win-x86 \
  --compress Brotli \
  --output dist/ferreteria-app.exe \
  .

echo ""
echo "✓ Compilación completada"
echo ""

# 5. Verificar tamaño
if [ -f "dist/ferreteria-app.exe" ]; then
  SIZE=$(du -sh dist/ferreteria-app.exe | cut -f1)
  echo "📦 Archivo generado:"
  echo "   Ruta: dist/ferreteria-app.exe"
  echo "   Tamaño: $SIZE"
  echo ""
  echo "✓ ¡EXE LISTO PARA USAR!"
  echo ""
  echo "Para iniciar en Windows 7:"
  echo "  1. Copie: ferreteria-app.exe"
  echo "  2. Doble clic en cualquier PC"
  echo "  3. Se abrirá automáticamente en el navegador"
  echo ""
else
  echo "❌ Error: No se pudo generar el EXE"
  exit 1
fi
