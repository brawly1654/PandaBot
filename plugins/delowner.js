import fs from 'fs';
import path from 'path';
import { ownerNumber } from '../config.js';

const SUPER_OWNER = '+166164298780822';

export const command = 'delowner';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];
  const senderNum = `+${sender}`;

  if (senderNum !== SUPER_OWNER) {
    return sock.sendMessage(from, { text: '⛔ No tienes permiso para usar este comando.' }, { quoted: msg });
  }

  if (args.length === 0 && !msg.message.extendedTextMessage) {
    return sock.sendMessage(from, { text: '⚠️ Debes mencionar o escribir un número.\nEjemplo: .delowner @usuario o .delowner +56912345678' }, { quoted: msg });
  }

  let delOwner;
  if (msg.message.extendedTextMessage) {
    const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid || [];
    if (mentioned.length > 0) {
      delOwner = `+${mentioned[0].split('@')[0]}`;
    }
  } else {
    delOwner = args[0];
  }

  if (!delOwner.startsWith('+')) {
    delOwner = `+${delOwner.replace(/\D/g, '')}`;
  }

  if (!ownerNumber.includes(delOwner)) {
    return sock.sendMessage(from, { text: '⚠️ Ese número no está en la lista de owners.' }, { quoted: msg });
  }

  const newList = ownerNumber.filter(num => num !== delOwner);

  // Modificar config.js
  const configPath = path.resolve('./config.js');
  let configContent = fs.readFileSync(configPath, 'utf8');

  const ownersString = JSON.stringify(newList, null, 28);
  configContent = configContent.replace(
    /export const ownerNumber = (\[[^\]]*\]);/,
    `export const ownerNumber = ${ownersString};`
  );

  fs.writeFileSync(configPath, configContent, 'utf8');

  await sock.sendMessage(from, { text: `✅ Se ha eliminado a *${delOwner}* de la lista de owners.\n🔄 Reinicia el bot para aplicar cambios.` }, { quoted: msg });
}
