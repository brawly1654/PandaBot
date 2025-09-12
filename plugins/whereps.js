export const command = 'whereps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const personaje = args.join(' ').trim().toLowerCase();

  if (!personaje) {
    await sock.sendMessage(from, { text: '❗ Uso correcto: `.whereps <nombre del personaje>`' }, { quoted: msg });
    return;
  }

  let foundUser = null;

  for (const user in global.cmDB) {
    const data = global.cmDB[user];
    if (data.personajes && data.personajes.some(p => p.toLowerCase() === personaje)) {
      foundUser = user;
      break;
    }
  }

  if (foundUser) {
    await sock.sendMessage(from, { text: `🔍 El personaje *${personaje}* pertenece a: @${foundUser}` }, { quoted: msg, mentions: [`${foundUser}@s.whatsapp.net`] });
  } else {
    await sock.sendMessage(from, { text: `❌ El personaje *${personaje}* no fue encontrado.` }, { quoted: msg });
  }
}
