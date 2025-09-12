import fs from 'fs';

export const command = 'unwarn';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length === 0) {
    await sock.sendMessage(from, { text: '✅ Usa .unwarn @usuario para quitar una advertencia.' });
    return;
  }

  // Verificar si quien envía es admin
  const metadata = await sock.groupMetadata(from);
  const sender = msg.key.participant;
  const senderIsAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!senderIsAdmin) {
    await sock.sendMessage(from, { text: '❌ Solo los admins pueden usar este comando.' });
    return;
  }

  const target = mentions[0];
  const warnsFile = './data/warns.json';
  let warns = {};
  if (fs.existsSync(warnsFile)) {
    warns = JSON.parse(fs.readFileSync(warnsFile, 'utf8'));
  }

  warns[from] = warns[from] || {};
  if (warns[from][target]) {
    warns[from][target]--;
    if (warns[from][target] < 0) warns[from][target] = 0;
    fs.writeFileSync(warnsFile, JSON.stringify(warns, null, 2));
    await sock.sendMessage(from, { text: `✅ Quitada una advertencia a @${target.split('@')[0]}. Ahora tiene ${warns[from][target]}.`, mentions: [target] });
  } else {
    await sock.sendMessage(from, { text: '⚠️ Ese usuario no tiene advertencias.' });
  }
}
