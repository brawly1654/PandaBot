export const command = 'pay';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderID = sender.split('@')[0];

  // Validaciones básicas
  if (!args[0] || !args[1]) {
    await sock.sendMessage(from, { text: '❌ Usa el comando así: *.pay <cantidad> @usuario*' }, { quoted: msg });
    return;
  }

  const cantidad = parseInt(args[0]);
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (isNaN(cantidad) || cantidad <= 0) {
    await sock.sendMessage(from, { text: '❌ La cantidad debe ser un número válido mayor a 0.' }, { quoted: msg });
    return;
  }

  if (!mentioned) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario para transferirle monedas.' }, { quoted: msg });
    return;
  }

  const receptorID = mentioned.split('@')[0];

  // Crear perfiles si no existen
  if (!global.cmDB[senderID]) {
    global.cmDB[senderID] = { spins: 5, coins: 0, shields: 0, villageLevel: 1 };
  }

  if (!global.cmDB[receptorID]) {
    global.cmDB[receptorID] = { spins: 5, coins: 0, shields: 0, villageLevel: 1 };
  }

  // Validar saldo
  if (global.cmDB[senderID].coins < cantidad) {
    await sock.sendMessage(from, {
      text: `❌ No tienes suficientes monedas. Actualmente tienes *${global.cmDB[senderID].coins}* 🪙.`,
    }, { quoted: msg });
    return;
  }

  // Realizar transferencia
  global.cmDB[senderID].coins -= cantidad;
  global.cmDB[receptorID].coins += cantidad;
  global.guardarCM();

  // Enviar mensaje
  await sock.sendMessage(from, {
    text: `💸 *@${senderID}* le ha transferido *${cantidad.toLocaleString()} monedas* a *@${receptorID}*!😳`,
    mentions: [sender, mentioned]
  }, { quoted: msg });
}
