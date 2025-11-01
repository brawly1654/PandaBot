import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { ownerNumber } from '../config.js';

export const command = 'unbanuser';

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
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario: .unbanuser @usuario <motivo>' });
    return;
  }

  const targetJid = mentionJids[0];
  const targetNumber = targetJid.split('@')[0];
  const motivo = args.slice(1).join(' ') || 'Sin motivo especificado';

  const db = cargarDatabase();
  db.bannedUsers = db.bannedUsers || [];

  const index = db.bannedUsers.indexOf(targetJid);
  if (index > -1) {
    db.bannedUsers.splice(index, 1);
    guardarDatabase(db);

    await sock.sendMessage(from, {
      text: `✅ Usuario @${targetNumber} desbaneado.\n📝 Motivo: ${motivo}`,
      mentions: [targetJid]
    });

    await sock.sendMessage(alertGroup, {
      text: `✅ @${targetNumber} ha sido *desbaneado del bot*\n📝 Motivo: ${motivo}`,
      mentions: [targetJid]
    });

  } else {
    await sock.sendMessage(from, {
      text: `⚠️ El usuario @${targetNumber} no estaba baneado.`,
      mentions: [targetJid]
    });
  }
}
