import fs from 'fs';
import { ownerNumber } from '../config.js';

export const command = 'warn';

function normalizeId(id) {
  return id.split('@')[0].replace(/[^\d]/g, '');
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderRaw = msg.key.participant || msg.key.remoteJid;
  const senderNumber = normalizeId(senderRaw);
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];


  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(
    p => normalizeId(p.id) === senderNumber && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isOwner = ownerNumber.some(o => normalizeId(o) === senderNumber);

  if (!isAdmin && !isOwner) {
    await sock.sendMessage(from, { text: '🚫 Solo los administradores o el owner pueden usar este comando.' });
    return;
  }

   if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '⚠️ Usa .warn @usuario para advertir a alguien.' });
    return;
  }

  const target = mentions[0];
  const warnsFile = './data/warns.json';
  let warns = {};

  if (fs.existsSync(warnsFile)) {
    warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
  }

  warns[from] = warns[from] || {};
  warns[from][target] = (warns[from][target] || 0) + 1;

  fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));

  await sock.sendMessage(from, {
    text: `⚠️ @${target.split('@')[0]} ahora tiene ${warns[from][target]} advertencia(s).`,
    mentions: [target]
  });

  // Expulsar si llega a 3
  if (warns[from][target] >= 3) {
    await sock.sendMessage(from, {
      text: `🚫 @${target.split('@')[0]} ha sido expulsado por acumular 3 advertencias.`,
      mentions: [target]
    });
    await sock.groupParticipantsUpdate(from, [target], 'remove');
    warns[from][target] = 0; // Reiniciar advertencias
    fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
  }
}
