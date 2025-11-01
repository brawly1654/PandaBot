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
  const alertGroup = '120363421450862624@g.us';

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

  const cantidad = warns[from][target];
  const targetTag = `@${target.split('@')[0]}`;

  await sock.sendMessage(from, {
    text: `
⚠️ ${targetTag} ahora tiene ${cantidad} advertencia(s).
Revisa tus advertencias o las de otros usuarios en el grupo correspondiente de la comunidad
https://chat.whatsapp.com/FDnThaEo9876v1Q1Jn5f9P?mode=wwt
          `,
    mentions: [target]
  });

  await sock.sendMessage(alertGroup, {
    text: `⚠️ ${targetTag} ha recibido una advertencia.\n📍 Grupo: ${metadata.subject}\n📊 Total: ${cantidad}`,
    mentions: [target]
  });

  if (cantidad >= 3) {
    await sock.sendMessage(from, {
      text: `🚫 ${targetTag} ha sido expulsado por acumular 3 advertencias.`,
      mentions: [target]
    });

    await sock.sendMessage(alertGroup, {
      text: `🚫 ${targetTag} ha sido *expulsado* por acumular 3 advertencias.\n📍 Grupo: ${metadata.subject}`,
      mentions: [target]
    });

    await sock.groupParticipantsUpdate(from, [target], 'remove');
    warns[from][target] = 0;
    fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
  }
}
