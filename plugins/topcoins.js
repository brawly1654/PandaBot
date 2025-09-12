import { jidDecode } from '@whiskeysockets/baileys';

export const command = 'topcoins';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Devuelve un JID clásico o el original
  function normalizarJid(jid) {
    const decoded = jidDecode(jid);
    return decoded ? `${decoded.user}@${decoded.server}` : jid;
  }

  // Devuelve nombre personalizado, número, o fallback del JID
  function mostrarNombre(jid) {
    const decoded = jidDecode(jid);
    const usuario = decoded ? `+${decoded.user}` : `@${jid.split('@')[0]}`;
    return usuario;
  }

  const ranking = Object.entries(global.cmDB)
    .sort((a, b) => b[1].coins - a[1].coins)
    .slice(0, 5);

  if (ranking.length === 0) {
    await sock.sendMessage(from, { text: '🥲 No hay datos aún para mostrar el top de monedas.' }, { quoted: msg });
    return;
  }

  let texto = '🏅 *Top 5 usuarios con más monedas (Coin Master)*\n\n';
  const mentions = [];

  ranking.forEach(([jid, data], i) => {
    const realJid = normalizarJid(jid);
    const nombre = data.name ? data.name : mostrarNombre(jid);
    texto += `${i + 1}. *${nombre}* – 💰 ${data.coins} monedas\n`;
    mentions.push(realJid);
  });

  await sock.sendMessage(from, { text: texto, mentions }, { quoted: msg });
}

