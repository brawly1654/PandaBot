import fs from 'fs';

export const command = 'calcularamor';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];

  if (mentions.length < 2) {
    await sock.sendMessage(from, { text: '💘 Usa .calcularamor @usuarioA @usuarioB para saber el porcentaje de amor.' });
    return;
  }

  const [a, b] = mentions;
  const lovePercent = Math.floor(Math.random() * 101);
  const text = `💗 El amor entre @${a.split('@')[0]} y @${b.split('@')[0]} es de *${lovePercent}%* 🌹`;

  // Guardar pareja
  const parejasFile = './data/parejas.json';
  const parejas = JSON.parse(fs.readFileSync(parejasFile, 'utf8'));
  parejas.push({ a, b, percent: lovePercent });
  fs.writeFileSync(parejasFile, JSON.stringify(parejas, null, 2));

  await sock.sendMessage(from, { text, mentions: [a, b] });
}
