#!/data/data/com.termux/files/usr/bin/bash

echo "🔄 Iniciando PandaBot con pm2..."

# Iniciar el bot usando el archivo de configuración
pm2 start ecosystem.config.cjs

# Guardar configuración de pm2
pm2 save

echo "✅ PandaBot está corriendo! Usa 'pm2 logs bot' para ver los logs."

