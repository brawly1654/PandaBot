import { ownerNumber } from '../config.js';

export const command = 'demote';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '⚠️ Usa .demote @usuario para quitar admin.' });
    return;
  }

  const metadata = await sock.groupMetadata(from);
  const senderId = sender.includes('@') ? sender : `${sender}@s.whatsapp.net`;
  const isAdmin = metadata.participants.some(p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin'));
  const isOwner = ownerNumber.includes(`+${senderId.split('@')[0]}`);

  if (!isAdmin && !isOwner) {
    await sock.sendMessage(from, { text: '🚫 Solo admins o owner pueden usar este comando.' });
    return;
  }

  try {
    await sock.groupParticipantsUpdate(from, mentions, 'demote');
    await sock.sendMessage(from, { text: `✅ Usuario(s) degradado(s) de admin.`, mentions });
  } catch (e) {
    console.error('❌ Error en demote:', e);
    await sock.sendMessage(from, { text: '❌ Error al degradar.' });
  }
}
