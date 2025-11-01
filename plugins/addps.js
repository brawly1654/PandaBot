import fs from 'fs/promises';

export const command = 'addps';

const OWNER_IDS = ['56953508566', '166164298780822'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

  if (!OWNER_IDS.includes(sender)) {
    await sock.sendMessage(from, { text: '❌ Solo los dueños del bot pueden usar este comando.' });
    return;
  }

  const input = args.join(' ');
  if (!input || !input.includes('|') || input.split('|').length < 3) {
    await sock.sendMessage(from, { text: '❌ Uso: .addps <nombre> | <calidad> | <precio>' });
    return;
  }

  const [nombre, calidad, precioStr] = input.split('|').map(s => s.trim());
  const precio = Number(precioStr);

  if (isNaN(precio)) {
    await sock.sendMessage(from, { text: 'El precio debe ser un número.' });
    return;
  }

  try {
    const data = JSON.parse(await fs.readFile('./data/personajes.json', 'utf8'));
    const personajes = data.characters;

    const existe = personajes.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      await sock.sendMessage(from, { text: `❌ El personaje *${nombre}* ya existe.` });
      return;
    }

    personajes.push({ nombre, calidad, precio });
    await fs.writeFile('./data/personajes.json', JSON.stringify(data, null, 2));

    await sock.sendMessage(from, { text: `✅ Personaje *${nombre}* agregado con calidad *${calidad}* y precio *${precio}*.` });
  } catch (error) {
    console.error('Error al agregar personaje:', error);
    await sock.sendMessage(from, { text: '❌ Error al agregar personaje.' });
  }
}

