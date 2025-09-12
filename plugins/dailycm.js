export const command = 'dailycm';

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

  const now = Date.now();
  if (!global.cmDB[user].lastDaily || now - global.cmDB[user].lastDaily > 86400000) {
    global.cmDB[user].spins += 5;
    global.cmDB[user].lastDaily = now;
    global.guardarCM();
    await sock.sendMessage(from, { text: `🎁 Has reclamado tus *5 giros diarios*, @+${user}!` }, { quoted: msg });
  } else {
    const timeLeft = 86400000 - (now - global.cmDB[user].lastDaily);
    const mins = Math.floor(timeLeft / 60000);
    await sock.sendMessage(from, { text: `⏳ Debes esperar *${mins} minutos* para reclamar el siguiente daily.` }, { quoted: msg });
  }
}
