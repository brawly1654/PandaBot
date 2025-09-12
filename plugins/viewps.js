import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'viewps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const lista = personajes.map(p => {
    let efectosText = p.efectos && p.efectos.length > 0 ? ` [Efectos: ${p.efectos.join(', ')}]` : '';
    return `✨ *${p.nombre}* [${p.calidad}]${efectosText}\n💰 ${p.precio.toLocaleString()} Pandacoins\n📝 ${p.descripcion}\n`;
  }).join('\n');

  const texto = `🎭 *Personajes disponibles para comprar:*\n\n${lista}\nPara comprar: *.buy NombrePersonaje*`;

  await sock.sendMessage(from, { text: texto }, { quoted: msg });
}

