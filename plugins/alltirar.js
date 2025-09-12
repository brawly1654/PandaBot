export const command = 'alltirar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  if (!global.cmDB[user]) {
    global.cmDB[user] = {
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1
    };
  }

  const data = global.cmDB[user];

  if (data.spins <= 0) {
    await sock.sendMessage(from, {
      text: `⚠️ *${user}*, no tienes más giros. Usa .daily para reclamar más.`,
    }, { quoted: msg });
    return;
  }

  const rewards = [
    { emoji: '🪙', action: () => { data.coins += 5000; return 'Ganaste *5,000 monedas* 🪙'; } },
    { emoji: '🛡', action: () => {
        if (data.shields >= 3) return 'Escudo omitido (máximo alcanzado) 🛡';
        data.shields += 1;
        return 'Obtuviste *1 escudo* 🛡';
      }
    },
    { emoji: '💣', action: () => '¡Activaste *ATAQUE*! 💣 Usa .atacar @usuario' },
    { emoji: '🦹', action: () => '¡Toca *ROBO*! 🦹 Usa .robar @usuario' },
    { emoji: '⚡', action: () => { data.spins += 2; return '¡+2 giros extra! ⚡'; } }
  ];

  let resultText = '';
  let rewardMessages = '';
  let totalSpins = 0;

  while (data.spins > 0) {
    data.spins--;
    totalSpins++;

    const result = [
      rewards[Math.floor(Math.random() * rewards.length)],
      rewards[Math.floor(Math.random() * rewards.length)],
      rewards[Math.floor(Math.random() * rewards.length)],
    ];

    resultText += result.map(r => r.emoji).join(' | ') + '\n';
    rewardMessages += result.map(r => r.action()).join('\n') + '\n\n';
  }

  global.guardarCM();

  const reply = `
🎰 *Coin Master - TIRADAS AUTOMÁTICAS* 🎰

🎲 Total de tiradas: *${totalSpins}*

🎲 Resultados:
${resultText.trim()}

🎁 Recompensas:
${rewardMessages.trim()}

🎯 Giros restantes: ${data.spins}
🏘 Aldea nivel: ${data.villageLevel}
💰 Monedas: ${data.coins}
🛡 Escudos: ${data.shields}
`.trim();

  await sock.sendMessage(from, { text: reply }, { quoted: msg });
}
