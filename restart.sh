#!/data/data/com.termux/files/usr/bin/bash

echo "♻️ Reiniciando PandaBot..."

pm2 restart bot

echo "✅ PandaBot reiniciado! Usa 'pm2 logs bot' para ver los logs."

