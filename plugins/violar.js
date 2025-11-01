import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { ownerNumber } from '../config.js';

export const command = 'violar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderId = sender.split('@')[0];

  if (!ownerNumber.includes(`+${senderId}`)) {
    await sock.sendMessage(from, {
      text: '❌ Este comando solo puede ser usado por los owners.'
    }, { quoted: msg });
    return;
  }

  const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
  const mencionado = msg.mentionedJid?.[0] || contextInfo?.mentionedJid?.[0];

  if (!mencionado || mencionado === sender) {
    await sock.sendMessage(from, {
      text: ' Debes mencionar a alguien para violarlo.'
    }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0 };
  db.users[mencionado] = db.users[mencionado] || { pandacoins: 0 };

  const atacante = db.users[sender];
  const victima = db.users[mencionado];

  const monto = Math.min(1000000, victima.pandacoins);
  atacante.pandacoins += monto;
  victima.pandacoins -= monto;

  guardarDatabase(db);

  const texto = ` *Violación ejecutada*\n\n@${senderId} se violó a @${mencionado.split('@')[0]} y le robó *${monto.toLocaleString()} pandacoins* sin piedad.`;

  await sock.sendMessage(from, {
    text: texto,
    mentions: [sender, mencionado]
  }, { quoted: msg });

  await sock.sendMessage(from, {
    react: { text: '🍆', key: msg.key }
  });
}
