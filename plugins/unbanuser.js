import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { ownerNumber } from '../config.js';

export const command = 'unbanuser';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  // Solo owner
  if (!ownerNumber.includes(`+${senderNumber}`)) {
    await sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando.' });
    return;
  }

  if (!args[0]) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario: .unbanuser @usuario' });
    return;
  }

  // Extraer número limpio
  const mention = args[0].replace(/[^0-9]/g, '');
  const targetJid = `${mention}@s.whatsapp.net`;

  const db = cargarDatabase();
  db.bannedUsers = db.bannedUsers || [];

  if (db.bannedUsers.includes(targetJid)) {
    db.bannedUsers = db.bannedUsers.filter(u => u !== targetJid);
    guardarDatabase(db);
    await sock.sendMessage(from, { 
      text: `✅ Usuario desbaneado correctamente.`, 
      mentions: [targetJid] 
    });
  } else {
    await sock.sendMessage(from, { 
      text: `⚠️ El usuario no estaba baneado.`, 
      mentions: [targetJid] 
    });
  }
}
