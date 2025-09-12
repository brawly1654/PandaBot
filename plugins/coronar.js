import { ownerNumber } from '../config.js';

export const command = 'coronar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando solo puede usarse en grupos.' });
    return;
  }

  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = '+' + sender.split('@')[0];

  // Solo el owner puede usarlo
  if (!ownerNumber.includes(senderNumber)) {
    await sock.sendMessage(from, {
      text: '⛔ Solo los *dueños del bot* puede usar este comando.'
    }, { quoted: msg });
    return;
  }

  const ownerJid = senderNumber.replace('+', '') + '@s.whatsapp.net';

  try {
    await sock.groupParticipantsUpdate(from, [ownerJid], 'promote');

    await sock.sendMessage(from, {
      react: { text: '👑', key: msg.key }
    });

    await sock.sendMessage(from, {
      text: `👑 *Fuiste coronado con éxito.*\nAhora eres *administrador* del grupo.`,
      mentions: [ownerJid]
    }, { quoted: msg });
  } catch (err) {
    console.error('❌ Error al promover al owner:', err);
    await sock.sendMessage(from, {
      text: '❌ No se pudo otorgar admin. Asegúrate de que el bot tenga permisos.'
    }, { quoted: msg });
  }
}
