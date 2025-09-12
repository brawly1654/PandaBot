import fs from 'fs';
const parejasFile = './data/parejas.json';

export const command = 'divorcio';

export async function run(sock, msg, args) {
  const sender = msg.key.participant || msg.key.remoteJid;

  // Cargar parejas
  if (!fs.existsSync(parejasFile)) fs.writeFileSync(parejasFile, '{}');
  const parejas = JSON.parse(fs.readFileSync(parejasFile));

  // Verificar si el usuario está casado
  if (!parejas[sender]) {
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ No estás casado con nadie.' }, { quoted: msg });
    return;
  }

  const pareja = parejas[sender];
  delete parejas[sender];
  delete parejas[pareja];

  fs.writeFileSync(parejasFile, JSON.stringify(parejas, null, 2));

  await sock.sendMessage(msg.key.remoteJid, {
    text: `💔 Has divorciado de @${pareja.split('@')[0]}.`,
    mentions: [pareja]
  }, { quoted: msg });
}
