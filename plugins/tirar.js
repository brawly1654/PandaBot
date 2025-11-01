export const command = 'tirar';

const cooldowns = {}; // Estructura para controlar cooldowns por usuario

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  const now = Date.now();
  if (cooldowns[user] && now - cooldowns[user] < 7000) {
    const timeLeft = ((7000 - (now - cooldowns[user])) / 1000).toFixed(1);
    await sock.sendMessage(from, { text: `⏳ Espera *${timeLeft}s* para usar este comando de nuevo, *@${user}*.` }, { quoted: msg, mentions: [sender] });
    return;
  }

  cooldowns[user] = now;

  // Inicializar datos si no existen
  if (!global.cmDB[user]) {
    global.cmDB[user] = {
      spins: 5,
      coins: 0,
      shields: 0,
      villageLevel: 1,
      creditos: 0
    };
  }

  const data = global.cmDB[user];

  if (data.spins <= 0) {
    await sock.sendMessage(from, {
      text: `⚠️ *@${user}*, no tienes más giros. Usa *.dailycm* para reclamar más.`,
      mentions: [sender]
    }, { quoted: msg });
    return;
  }

  data.spins--;

  const rewards = [
    {
      emoji: '🪙',
      action: () => {
        data.coins += 8000;
        return 'Ganaste *8,000 monedas* 🪙';
      }
    },
    {
      emoji: '🛡',
      action: () => {
        if (data.shields >= 2) return '⚠️ Ya tienes *2 escudos*, no puedes obtener más 🛡';
        data.shields += 1;
        return 'Obtuviste *1 escudo* 🛡';
      }
    },
    {
     emoji: '🎫',
     action: () => {
       data.creditos +=15;
       return '¡+15 Créditos! 🎫';
     }
   },
    {
      emoji: '⚡️',
      action: () => {
        data.spins += 2;
        return '¡+2 giros extra! ⚡';
      }
    }
  ];

  const result = [
    rewards[Math.floor(Math.random() * rewards.length)],
    rewards[Math.floor(Math.random() * rewards.length)],
    rewards[Math.floor(Math.random() * rewards.length)],
  ];

  const resultText = result.map(r => r.emoji).join(' | ');
  const rewardMessages = result.map(r => r.action()).join('\n');

  global.guardarCM();

  const reply = `
🎰 *Coin Master - TIRADA DE SLOT* 🎰

🎲 Resultado:
${resultText}

🎁 Recompensas:
${rewardMessages}

🎯 Giros restantes: ${data.spins}
🏘 Aldea nivel: ${data.villageLevel}
💰 Monedas: ${data.coins}
🛡 Escudos: ${data.shields}
🎫 Créditos: ${data.creditos}
`.trim();

  await sock.sendMessage(from, { text: reply }, { quoted: msg });
}
