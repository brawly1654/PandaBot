import { cargarDatabase } from '../data/database.js';

export const command = 'listavip';

const cooldowns = {}; // { chatId: timestamp }

function formatTime(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const now = Date.now();

  // ⏳ Cooldown por chat (1 hora)
  if (cooldowns[from] && now - cooldowns[from] < 60 * 60 * 1000) {
    const restante = formatTime(60 * 60 * 1000 - (now - cooldowns[from]));
    await sock.sendMessage(from, {
      text: `⏳ Este comando tiene cooldown de 1 hora.\nIntenta nuevamente en ${restante}.`
    }, { quoted: msg });
    return;
  }

  cooldowns[from] = now;

  const db = cargarDatabase();
  db.users = db.users || {};

  const vipList = Object.entries(db.users)
    .filter(([jid, user]) => user.vip && user.vipExpiration > now)
    .map(([jid, user]) => {
      const restante = user.vipExpiration - now;
      return `• @${jid.split('@')[0]} → ${formatTime(restante)} restante`;
    });

  if (vipList.length === 0) {
    await sock.sendMessage(from, {
      text: '📭 No hay usuarios VIP activos en este momento.'
    }, { quoted: msg });
    return;
  }

  const texto = `👑 *Lista de usuarios VIP activos:*\n\n${vipList.join('\n')}`;
  const mentions = vipList.map(line => line.match(/@(\d+)/)?.[0] + '@s.whatsapp.net').filter(Boolean);

  await sock.sendMessage(from, {
    text: texto,
    mentions
  }, { quoted: msg });
}
