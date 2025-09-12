import { ownerNumber } from '../config.js';

export const command = 'kick';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Solo funciona en grupos
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando solo puede usarse en grupos.' });
    return;
  }

  // Sacamos el número de quien ejecuta el comando
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  // Revisamos si es admin o owner
  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(
    p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin')
  );
  const isOwner = ownerNumber.includes(`+${senderNumber}`);

  if (!isAdmin && !isOwner) {
    await sock.sendMessage(from, { text: '❌ Solo los admins o el owner pueden usar este comando.' });
    return;
  }

  let targetJid;

  // Si respondió a un mensaje
  if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    targetJid = msg.message.extendedTextMessage.contextInfo.participant;
  }
  // Si mencionó a alguien
  else if (args[0]) {
    const mention = args[0].replace(/[^0-9]/g, '');
    targetJid = mention + '@s.whatsapp.net';
  } else {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario o responder a su mensaje: .kick @usuario' });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(from, [targetJid], 'remove');
    await sock.sendMessage(from, { text: `✅ Usuario expulsado: @${targetJid.split('@')[0]}`, mentions: [targetJid] });
  } catch (e) {
    console.error('❌ Error al expulsar:', e);
    await sock.sendMessage(from, { text: '⚠️ No pude expulsar al usuario. Asegúrate de que soy admin.' });
  }
}
