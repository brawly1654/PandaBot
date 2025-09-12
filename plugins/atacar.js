export const command = 'atacar';

const cooldown = 15 * 60 * 1000; // 15 minutos en milisegundos
let attackCooldown = {};

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  if (!global.cmDB[user]) {
    global.cmDB[user] = { spins: 5, coins: 0, shields: 2, villageLevel: 1 };
  }

  const data = global.cmDB[user];
  const now = Date.now();

  if (attackCooldown[user] && now - attackCooldown[user] < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - attackCooldown[user])) / 60000);
    return sock.sendMessage(from, {
      text: `🕒 *@+${user}*, debes esperar ${timeLeft} minuto(s) para volver a usar *atacar*.`
    }, { quoted: msg });
  }

  const targetMention = args[0];
  if (!targetMention || !targetMention.startsWith('@')) {
    return sock.sendMessage(from, { text: `⚠️ Usa el comando así: *.atacar @usuario*` }, { quoted: msg });
  }

  const target = targetMention.replace('@', '');
  if (!global.cmDB[target]) {
    return sock.sendMessage(from, { text: `❌ El usuario no tiene cuenta en Coin Master.` }, { quoted: msg });
  }

  const targetData = global.cmDB[target];
  if (targetData.shields > 0) {
    targetData.shields--;
    attackCooldown[user] = now;
    global.guardarCM();
    return sock.sendMessage(from, { text: `🛡 El escudo de *@+${target}* bloqueó tu ataque.` }, { quoted: msg });
  }

  const stolenCoins = Math.floor(Math.random() * 30000) + 10000;
  const coinsTaken = Math.min(stolenCoins, targetData.coins);
  targetData.coins -= coinsTaken;
  data.coins += coinsTaken;
  attackCooldown[user] = now;
  global.guardarCM();

  await sock.sendMessage(from, {
    text: `💣 Atacaste la aldea de *@+${target}* y le robaste *${coinsTaken.toLocaleString()} monedas*.`
  }, { quoted: msg });
}
