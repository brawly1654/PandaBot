export const command = 'groupinfo';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const metadata = await sock.groupMetadata(from);
    const admins = metadata.participants.filter(p => p.admin).length;
    const texto = `👥 *Información del grupo*\n
📛 Nombre: *${metadata.subject}*
🆔 ID: *${metadata.id}*
👤 Participantes: *${metadata.participants.length}*
🛡️ Admins: *${admins}*
📅 Creado el: *${new Date(metadata.creation * 1000).toLocaleString()}*
👑 Creador: *@${metadata.owner ? metadata.owner.split('@')[0] : 'desconocido'}*`;

    await sock.sendMessage(from, { text: texto, mentions: metadata.owner ? [metadata.owner] : [] });
  } catch (e) {
    console.error('❌ Error en groupinfo:', e);
    await sock.sendMessage(from, { text: '❌ Error al obtener info del grupo.' });
  }
}
