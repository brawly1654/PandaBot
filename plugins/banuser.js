import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { ownerNumber } from '../config.js';

export const command = 'banuser';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const alertGroup = '120363421450862624@g.us';

  if (!ownerNumber.includes(`+${senderNumber}`)) {
    await sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando.' });
    return;
  }

  const mentionJids = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentionJids.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario: .banuser @usuario <motivo>' });
    return;
  }

  const targetJid = mentionJids[0];
  const targetNumber = targetJid.split('@')[0];
  const motivo = args.slice(1).join(' ') || 'Sin motivo especificado';

  const db = cargarDatabase();
  db.bannedUsers = db.bannedUsers || [];

  if (!db.bannedUsers.includes(targetJid)) {
    db.bannedUsers.push(targetJid);
    guardarDatabase(db);

    await sock.sendMessage(from, {
      text: `✅ Usuario @${targetNumber} baneado.\n📝 Motivo: ${motivo}`,
      mentions: [targetJid]
    });

    await sock.sendMessage(alertGroup, {
      text: `🚫 @${targetNumber} ha sido *baneado del bot*\n📝 Motivo: ${motivo}`,
      mentions: [targetJid]
    });

  } else {
    await sock.sendMessage(from, {
      text: `⚠️ Usuario @${targetNumber} ya estaba baneado.`,
      mentions: [targetJid]
    });
  }
}
