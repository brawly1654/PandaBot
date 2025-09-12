export const command = 'tirar10';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  if (!global.cmDB[user]) {
    global.cmDB[user] = { spins: 5, coins: 0, shields: 0, villageLevel: 1, creditos: 0 };
  }

  const data = global.cmDB[user];

  if (data.spins < 10) {
    await sock.sendMessage(from, { text: `⚠️ *@${user}*, necesitas al menos *10 giros* para usar este comando.` }, { quoted: msg });
    return;
  }

  let summary = '';
  let emojis = '';
  data.spins -= 10;

  const rewards = [
    { emoji: '🪙', action: () => { data.coins += 8000; return 'Ganaste *8,000 monedas* 🪙'; } },
    { emoji: '🛡', action: () => { if (data.shields >= 2) return '⚠️ Ya tienes *2 escudos*, no puedes obtener más 🛡'; data.shields += 1; return 'Obtuviste *1 escudo* 🛡'; } },
    {
     emoji: '🎫',
     action: () => {
       data.creditos +=15;
       return '¡+15 Créditos! 🎫';
     }
   },
    { emoji: '⚡', action: () => { data.spins += 2; return '¡+2 giros extra! ⚡'; } }
  ];

  for (let i = 0; i < 10; i++) {
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    emojis += `${reward.emoji} `;
    summary += `🎁 ${reward.action()}\n`;
  }

  global.guardarCM();

  const reply = `🎰 *Coin Master - 10 TIRADAS* 🎰

🎲 Resultado:
${emojis}

${summary.trim()}

🎯 Giros restantes: ${data.spins}
💰 Monedas: ${data.coins}
🛡 Escudos: ${data.shields}
🏘 Aldea nivel: ${data.villageLevel}
🎫 Créditos: ${data.creditos}
`;

  await sock.sendMessage(from, { text: reply }, { quoted: msg });
}



