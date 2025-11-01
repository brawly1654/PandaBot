import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'viewps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const personajesNormales = personajes.filter(p => !p.efectos);

  const lista = personajesNormales.map(p => {
    return `✨ *${p.nombre}* [${p.calidad}]\n💰 ${p.precio.toLocaleString()} Pandacoins\n📝 ${p.descripcion}\n`;
  }).join('\n');

  const texto = `🎭 *Personajes disponibles para comprar:*\n\n${lista}\nPara comprar: *.buy NombrePersonaje*`;

  await sock.sendMessage(from, { text: texto }, { quoted: msg });
}

