export const command = 'walletcm';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderJid = msg.key.participant || msg.key.remoteJid;

  const isMention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const targetJid = isMention || senderJid;
  const user = targetJid.split('@')[0];

  if (!global.cmDB[user]) {
    global.cmDB[user] = {
      name: '',
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1,
      creditos: 0
    };
  }

  const data = global.cmDB[user];
                                                                                                                                       const rankingAldea = Object.entries(global.cmDB)
    .sort((a, b) => b[1].villageLevel - a[1].villageLevel)
    .map(([u]) => u);
  const positionAldea = rankingAldea.indexOf(user) + 1;

  const rankingCoins = Object.entries(global.cmDB)
    .sort((a, b) => b[1].coins - a[1].coins)
    .map(([u]) => u);
  const positionCoins = rankingCoins.indexOf(user) + 1;

  const nombre = msg.pushName || `@${user}`;
  const text = `
🧑 Perfil de *${nombre}* – Coin Master

🎯 Giros: ${data.spins}
💰 Monedas: ${data.coins}
🛡 Escudos: ${data.shields}
🏘 Aldea Nivel: ${data.villageLevel}
🎫 Créditos: ${data.creditos}
📍 Posición en el top de aldeas: ${positionAldea}
🏅 Posición en el top de monedas: ${positionCoins}
`.trim();

  await sock.sendMessage(from, { text, mentions: [targetJid] }, { quoted: msg });
}

