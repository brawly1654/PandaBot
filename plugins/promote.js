import { ownerNumber } from '../config.js';

export const command = 'promote';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '⚠️ Usa .promote @usuario para hacer admin.' });
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
    await sock.groupParticipantsUpdate(from, mentions, 'promote');
    await sock.sendMessage(from, { text: `✅ Usuario(s) promovido(s) a admin.`, mentions });
  } catch (e) {
    console.error('❌ Error en promote:', e);
    await sock.sendMessage(from, { text: '❌ Error al promover.' });
  }
}
