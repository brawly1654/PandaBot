import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { ownerNumber } from '../config.js';

export const command = 'banuser';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  // Solo owner
  if (!ownerNumber.includes(`+${senderNumber}`)) {
    await sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando.' });
    return;
  }

  // Tomar el mencionado
  const mentionJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentionJids.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario: .banuser @usuario' });
    return;
  }

  const targetJid = mentionJids[0]; // ejemplo: '521234567890@s.whatsapp.net'
  const targetNumber = targetJid.split('@')[0];

  const db = cargarDatabase();
  db.bannedUsers = db.bannedUsers || [];

  if (!db.bannedUsers.includes(targetJid)) {
    db.bannedUsers.push(targetJid);
    guardarDatabase(db);
    await sock.sendMessage(from, { 
      text: `✅ Usuario @${targetNumber} baneado.`,
      mentions: [targetJid]
    });
  } else {
    await sock.sendMessage(from, { 
      text: `⚠️ Usuario @${targetNumber} ya estaba baneado.`,
      mentions: [targetJid]
    });
  }
}
