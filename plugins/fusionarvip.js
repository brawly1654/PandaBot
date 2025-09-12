import fs from 'fs';
import { cargarDatabase, guardarDatabase, guardarPersonajes } from '../data/database.js';
import { isVip } from '../utils/vip.js';

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

export const command = 'fusionarvip';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }

  const db = cargarDatabase();
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado.' });
    return;
  }

  if (!args.length || !args.join(' ').includes('|')) {
    await sock.sendMessage(from, { text: '❌ Uso: *.fusionarvip <nombre1> | <nombre2>*' });
    return;
  }

  const [nombre1, nombre2] = args.join(' ').split('|').map(a => a.trim().toLowerCase());

  user.personajes = user.personajes || [];

  const countP1 = user.personajes.filter(pName => pName.toLowerCase() === nombre1).length;
  const countP2 = user.personajes.filter(pName => pName.toLowerCase() === nombre2).length;

  if (nombre1 === nombre2 && countP1 < 2) {
    await sock.sendMessage(from, { text: `❌ Debes tener al menos 2 copias de *${nombre1}* para fusionarlas.` });
    return;
  }
  if (nombre1 !== nombre2 && (countP1 < 1 || countP2 < 1)) {
    await sock.sendMessage(from, { text: '❌ Debes tener ambos personajes para poder fusionarlos.' });
    return;
  }

  const p1data = personajes.find(p => p.nombre.toLowerCase() === nombre1);
  const p2data = personajes.find(p => p.nombre.toLowerCase() === nombre2);

  if (!p1data || !p2data) {
    await sock.sendMessage(from, { text: '❌ Uno o ambos personajes no existen en la lista maestra.' });
    return;
  }

  const precioFusion = Math.floor((p1data.precio + p2data.precio) / 2);

  if (user.pandacoins < precioFusion) {
    await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins. La fusión cuesta ${precioFusion}.` });
    return;
  }

  const mitad1 = p1data.nombre.slice(0, Math.ceil(p1data.nombre.length / 2));
  const mitad2 = p2data.nombre.slice(Math.floor(p2data.nombre.length / 2));
  const nuevoNombre = mitad1 + mitad2;

  const nuevoPersonaje = {
    nombre: nuevoNombre,
    calidad: 'Ultra-Legendario',
    precio: precioFusion * 2,
    descripcion: `Personaje fusionado por un VIP de ${p1data.nombre} y ${p2data.nombre}`
  };

  personajes.push(nuevoPersonaje);
  guardarPersonajes(personajes);

  let personajesTemp = [...user.personajes];
  const index1 = personajesTemp.findIndex(pName => pName.toLowerCase() === nombre1);
  if (index1 !== -1) {
    personajesTemp.splice(index1, 1);
  }
  const index2 = personajesTemp.findIndex(pName => pName.toLowerCase() === nombre2);
  if (index2 !== -1) {
    personajesTemp.splice(index2, 1);
  }
  user.personajes = personajesTemp;

  user.personajes.push(nuevoNombre);

  user.pandacoins -= precioFusion;
  guardarDatabase(db);

  await sock.sendMessage(from, { text: `✨ ¡Felicidades! Has fusionado a *${p1data.nombre}* y *${p2data.nombre}* para crear a *${nuevoNombre}* (Rareza: ${nuevoPersonaje.calidad}, Precio: ${nuevoPersonaje.precio}).` });
}

