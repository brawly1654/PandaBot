export const command = 'regalartiros';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderID = sender.split('@')[0];

  if (!args[0] || !args[1]) {
    await sock.sendMessage(from, { text: '❌ Usa el comando así: *.regalartiros <cantidad> @usuario*' }, { quoted: msg });
    return;
  }

  const cantidad = parseInt(args[0]);
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (isNaN(cantidad) || cantidad <= 0) {
    await sock.sendMessage(from, { text: '❌ La cantidad debe ser un número válido mayor a 0.' }, { quoted: msg });
    return;
  }

  if (!mentioned) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario para regalarle tiros.' }, { quoted: msg });
    return;
  }

  const receptorID = mentioned.split('@')[0];

  if (!global.cmDB[senderID]) {
    global.cmDB[senderID] = { spins: 5, coins: 0, shields: 0, villageLevel: 1 };
  }

  if (!global.cmDB[receptorID]) {
    global.cmDB[receptorID] = { spins: 5, coins: 0, shields: 0, villageLevel: 1 };
  }

  if (global.cmDB[senderID].spins < cantidad) {
    await sock.sendMessage(from, { text: `❌ No tienes suficientes tiros. Actualmente tienes *${global.cmDB[senderID].spins}* giros.` }, { quoted: msg });
    return;
  }

  global.cmDB[senderID].spins -= cantidad;
  global.cmDB[receptorID].spins += cantidad;
  global.guardarCM();

  await sock.sendMessage(from, {
    text: `🎁 *@${senderID}* le ha regalado *${cantidad} tiros* a *@${receptorID}*! 🎉`,
    mentions: [sender, mentioned]
  }, { quoted: msg });
}
