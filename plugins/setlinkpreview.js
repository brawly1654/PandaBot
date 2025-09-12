export const command = 'setlinkpreview';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    await sock.sendMessage(from, { text: '❌ Este comando solo puede ser usado en grupos.' });
    return;
  }

  const groupMetadata = await sock.groupMetadata(from);
  const senderId = msg.key.participant;
  const isAdmin = groupMetadata.participants.find(p => p.id === senderId)?.admin;
  if (!isAdmin) {
    await sock.sendMessage(from, { text: '❌ Solo los administradores pueden usar este comando.' });
    return;
  }

  const status = args[0]?.toLowerCase();
  if (status === 'on') {
    await sock.sendMessage(from, { text: '✅ Previsualización de enlaces activada.' });

  } else if (status === 'off') {

    await sock.sendMessage(from, { text: '✅ Previsualización de enlaces desactivada.' });

  } else {

    await sock.sendMessage(from, { text: '❌ Uso: .setlinkpreview <on|off>' });
  }
}

