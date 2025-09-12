import fs from 'fs';
import { cargarDatabase } from '../data/database.js';

export const command = 'checkps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const db = cargarDatabase();
  db.users = db.users || {};
  const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
  const allPersonajes = data.characters;

  // Lógica para .checkps <personaje>
  if (args.length > 0 && !msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
    const personajeInput = args.join(' ').toLowerCase().replace(/ /g, ' ');
    const personaje = allPersonajes.find(p => p.nombre.toLowerCase() === personajeInput);

    if (!personaje) {
      await sock.sendMessage(from, { text: `❌ El personaje *${personajeInput.replace(/_/g, ' ')}* no existe. Usa .viewps para ver la lista.` });
      return;
    }

    const owners = Object.keys(db.users).filter(userId =>
      (db.users[userId].personajes || []).includes(personaje.nombre)
    );

    if (owners.length === 0) {
      await sock.sendMessage(from, { text: `💔 Nadie tiene el personaje *${personaje.nombre.replace(/_/g, ' ')}* aún.` });
    } else {
      let texto = `🔍 *Usuarios que tienen a ${personaje.nombre.replace(/_/g, ' ')}*\n\n`;
      const mentions = [];
      for (const ownerId of owners) {
        const userNumber = ownerId.split('@')[0];
        texto += `• @${userNumber}\n`;
        mentions.push(ownerId);
      }
      await sock.sendMessage(from, { text: texto, mentions: mentions });
    }
    return;
  }

  // Lógica para .checkps @usuario
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const targetUser = mentionedJid || args[0];

  if (!targetUser) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario o escribir el nombre de un personaje.' });
    return;
  }

  const user = db.users[targetUser];
  
  if (!user || (user.personajes || []).length === 0) {
    await sock.sendMessage(from, { text: `📦 El usuario mencionado no tiene personajes o no está registrado.` });
    return;
  }

  let texto = `👤 *Personajes de @${targetUser.split('@')[0]}*\n\n`;
  const mentions = [targetUser];
  user.personajes = user.personajes || [];

  for (const nombre of user.personajes) {
    const p = allPersonajes.find(p => p.nombre === nombre);
    if (p) {
      texto += `• *${p.nombre.replace(/_/g, ' ')}* (${p.calidad})\n`;
    } else {
      texto += `• *${nombre.replace(/_/g, ' ')}* (desconocido)\n`;
    }
  }

  await sock.sendMessage(from, { text: texto, mentions: mentions });
}

