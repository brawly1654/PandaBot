import fs from 'fs/promises';

export const command = 'delps';
const OWNER_ID = '166164298780822'; // reemplaza por tu número sin @

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

  if (sender !== OWNER_ID) {
    await sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando.' });
    return;
  }

  if (args.length < 1) {
    await sock.sendMessage(from, { text: 'Uso: .delps <nombre>' });
    return;
  }

  const nombre = args.join(' ');

  try {
    const data = JSON.parse(await fs.readFile('./data/personajes.json', 'utf8'));
    let personajes = data.characters;

    const index = personajes.findIndex(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (index === -1) {
      await sock.sendMessage(from, { text: `❌ Personaje *${nombre}* no encontrado.` });
      return;
    }

    personajes.splice(index, 1);
    await fs.writeFile('./data/personajes.json', JSON.stringify(data, null, 2));

    await sock.sendMessage(from, { text: `✅ Personaje *${nombre}* eliminado.` });
  } catch (error) {
    console.error('Error al eliminar personaje:', error);
    await sock.sendMessage(from, { text: '❌ Error al eliminar personaje.' });
  }
}
