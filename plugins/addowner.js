import fs from 'fs';
import path from 'path';

export const command = 'addowner';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665'];
const isOwner = owners.includes(sender.split('@')[0])

  if (!isOwner) {
    return sock.sendMessage(from, { text: '⛔ No tienes permiso para usar este comando.' }, { quoted: msg });
  }

  if (args.length === 0 && !msg.message.extendedTextMessage) {
    return sock.sendMessage(from, { text: '⚠️ Debes mencionar o escribir un número.\nEjemplo: .addowner @usuario o .addowner +56912345678' }, { quoted: msg });
  }

  let newOwner;
  if (msg.message.extendedTextMessage) {
    const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid || [];
    if (mentioned.length > 0) {
      newOwner = `+${mentioned[0].split('@')[0]}`;
    }
  } else {
    newOwner = args[0];
  }

  if (!newOwner.startsWith('+')) {
    newOwner = `+${newOwner.replace(/\D/g, '')}`;
  }

  if (owner.includes(newOwner)) {
    return sock.sendMessage(from, { text: '⚠️ Ese número ya es owner.' }, { quoted: msg });
  }

  const configPath = path.resolve('./config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');

  const ownersString = JSON.stringify([...ownerNumber, newOwner], null, 28);
  configContent = configContent.replace(
    /export const ownerNumber = (\[[^\]]*\]);/,
    `export const ownerNumber = ${ownersString};`
  );

  fs.writeFileSync(configPath, configContent, 'utf8');

  await sock.sendMessage(from, { text: `✅ Se ha añadido a *${newOwner}* como owner.\n🔄 Reinicia el bot para aplicar cambios.` }, { quoted: msg });
}
