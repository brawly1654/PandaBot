import { ownerNumber } from '../config.js';
import fs from 'fs';
import path from 'path';

export const command = 'ordenarps';
export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];
  const senderId = sender.split('@')[0];

  if (!ownerNumber.includes(`+${senderId}`)) {
    await sock.sendMessage(from, {
      text: '🚫 No estás autorizado para usar este comando.'
    }, { quoted: msg });
    return;
  }

  const filePath = path.resolve('./data/personajes.json');
  if (!fs.existsSync(filePath)) {
    await sock.sendMessage(from, {
      text: '❌ No encontré el archivo personajes.json'
    }, { quoted: msg });
    return;
  }

  try {
    const db = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(db.characters)) {
      throw new Error('Formato inválido: falta propiedad characters');
    }

    db.characters.sort((a, b) => b.precio - a.precio);
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf-8');

    const top = db.characters.slice(0, 10)
      .map((p, i) => `${i + 1}. ${p.nombre} • ${p.calidad} • $${p.precio}`)
      .join('\n');

    await sock.sendMessage(from, {
      text: `✅ Personajes ordenados correctamente.\n\nTop 10 por precio:\n${top}`
    }, { quoted: msg });

  } catch (error) {
    console.error('Error en ordenarps:', error);
    await sock.sendMessage(from, {
      text: `❌ Ocurrió un error: ${error.message}`
    }, { quoted: msg });
  }
}
