export const command = 'megatirar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  if (!global.cmDB[user]) {
    global.cmDB[user] = { spins: 5, coins: 0, shields: 0, villageLevel: 1, creditos: 0 };
  }

  const data = global.cmDB[user];
  if (data.spins < 30) {
    await sock.sendMessage(from, { text: `⚠️ *@${user}*, necesitas al menos *30 giros* para usar este comando.` }, { quoted: msg, mentions: [sender] });
    return;
  }

  data.spins -= 30;

  const rewards = [
    { emoji: '🪙', value: 16000, type: 'coins' },
    { emoji: '🛡', value: 1, type: 'shields' },
    { emoji: '🎫', value: 30, type: 'creditos' },
    { emoji: '⚡️', value: 1, type: 'spins' }
  ];

  const rewardSummary = {
    coins: 0,
    shields: 0,
    creditos: 0,
    spins: 0,
    jackpots: 0
  };

  let allEmojis = '';
  const jackpotChance = 0.05;

  for (let i = 0; i < 30; i++) {
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    
    if (Math.random() < jackpotChance) {
      const jackpotCoins = Math.floor(Math.random() * 100000) + 40000;
      data.coins += jackpotCoins;
      rewardSummary.coins += jackpotCoins;
      rewardSummary.jackpots += 1;
      allEmojis += '💎 ';
    } else {
      switch (reward.type) {
        case 'coins':
          data.coins += reward.value;
          rewardSummary.coins += reward.value;
          break;
        case 'shields':
          if (data.shields < 2) data.shields += reward.value;
          rewardSummary.shields += reward.value;
          break;
        case 'creditos':
          data.creditos += reward.value;
          rewardSummary.creditos += reward.value;
          break;
        case 'spins':
          data.spins += reward.value;
          rewardSummary.spins += reward.value;
          break;
      }
      allEmojis += `${reward.emoji} `;
    }
  }

  global.guardarCM();

  const reply = `
🎰 *Coin Master - 30 TIRADAS* 🎰
---------------------------------

Hiciste 30 giros y esto es lo que pasó:

🎁 *Resumen de Recompensas:*
🪙 Monedas: +${rewardSummary.coins.toLocaleString()}
🛡 Escudos: +${rewardSummary.shields}
🎫 Créditos: +${rewardSummary.creditos}
⚡️ Giros extra: +${rewardSummary.spins}
💎 Jackpots: *${rewardSummary.jackpots}*

✨ *Tus estadísticas finales:*
🎯 Giros restantes: ${data.spins}
💰 Monedas: ${data.coins.toLocaleString()}
🛡 Escudos: ${data.shields}
🏘 Aldea nivel: ${data.villageLevel}
🎫 Créditos: ${data.creditos}

> PandaBot System.
`.trim();

  await sock.sendMessage(from, { text: reply }, { quoted: msg });
}

