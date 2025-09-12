import { ownerNumber } from '../config.js';
import fs from 'fs';

const file = './data/muteados.json';

function cargarMuteados() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

function guardarMuteados(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export const command = 'unmute';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando solo se puede usar en grupos.' });
    return;
  }

  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];
  const metadata = await sock.groupMetadata(from);
  const isAdmin = metadata.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
  const isOwner = ownerNumber.includes(`+${senderNumber}`);

  if (!isAdmin && !isOwner) {
    await sock.sendMessage(from, { text: '❌ Solo los admins o el owner pueden usar este comando.' });
    return;
  }

  const mention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mention) {
    await sock.sendMessage(from, { text: '⚠️ Menciona a un usuario para desmutearlo.\nEj: *.unmute @usuario*' });
    return;
  }

  const muteados = cargarMuteados();
  if (!muteados[from]) muteados[from] = [];

  if (muteados[from].includes(mention)) {
    muteados[from] = muteados[from].filter(id => id !== mention);
    guardarMuteados(muteados);
    await sock.sendMessage(from, { text: `🔊 El usuario fue *desmuteado*.`, mentions: [mention] });
  } else {
    await sock.sendMessage(from, { text: '⚠️ Ese usuario no estaba muteado.' });
  }
}
