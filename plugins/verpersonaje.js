import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'verps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args[0]) {
    await sock.sendMessage(from, { text: '❌ Debes escribir el nombre del personaje.\nEjemplo: .verpersonaje Chotavio' });
    return;
  }

  const nombreBuscado = args.join('_'); // Para igualar nombres con guiones bajos
  const personaje = personajes.find(p => p.nombre.toLowerCase() === nombreBuscado.toLowerCase());

  if (!personaje) {
    await sock.sendMessage(from, { text: `❌ No se encontró ningún personaje llamado "${args.join(' ')}"` });
    return;
  }

  const mensaje = `📛 *${personaje.nombre.replace(/_/g, ' ')}*\n` +
                  `✨ Calidad: *${personaje.calidad}*\n` +
                  `💰 Precio: *${personaje.precio.toLocaleString()} oro*\n\n` +
                  `📝 Descripción:\n${personaje.descripcion}`;

  await sock.sendMessage(from, { text: mensaje });
}
