import { isVip } from '../utils/vip.js';
import { cargarDatabase } from '../data/database.js';

export const command = 'checkvip';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const db = cargarDatabase();
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado.' });
    return;
  }

  if (isVip(sender)) {
    const expirationDate = new Date(user.vipExpiration);
    const formattedDate = expirationDate.toLocaleString('es-ES', { timeZone: 'America/Santiago' });
    const timeLeft = Math.ceil((user.vipExpiration - Date.now()) / (1000 * 60 * 60));

    await sock.sendMessage(from, { text: `👑 ¡Eres un usuario VIP!\n\nTu membresía expira en *${timeLeft} horas* (${formattedDate}).` });
  } else {
    await sock.sendMessage(from, { text: '❌ No eres un usuario VIP.' });
  }
}

