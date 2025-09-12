import fs from 'fs/promises';

export const command = 'addps3';
const OWNER_IDS = '1'; // reemplaza por tu número sin @

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

  if (sender !== OWNER_IDS) {
    await sock.sendMessage(from, { text: '❌ Solo Sai :3 puede usar este comando.' });
    return;
  }

  if (args.length < 3) {
    await sock.sendMessage(from, { text: 'Uso: .addps3 <nombre> <calidad> <precio>' });
    return;
  }

  const nombre = args[0];
  const calidad = args[1];
  const precio = Number(args[2]);

  if (isNaN(precio)) {
    await sock.sendMessage(from, { text: 'El precio debe ser un número :3' });
    return;
  }

  try {
    const data = JSON.parse(await fs.readFile('./data/personajes.json', 'utf8'));
    const personajes = data.characters;

    const existe = personajes.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
    if (existe) {
      await sock.sendMessage(from, { text: `❌ El personaje *${nombre}* ya existe :3` });
      return;
    }

    personajes.push({ nombre, calidad, precio });
    await fs.writeFile('./data/personajes.json', JSON.stringify(data, null, 2));

    await sock.sendMessage(from, { text: `✅ Personaje *${nombre}* agregado con calidad *${calidad}* y precio *${precio}*. Reinicia el Bot para aplicar cambios :3` });
  } catch (error) {
    console.error('Error al agregar personaje:', error);
    await sock.sendMessage(from, { text: '❌ Error al agregar personaje.' });
  }
}


