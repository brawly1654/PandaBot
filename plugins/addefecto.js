import fs from 'fs';
import path from 'path';

import { guardarPersonajes } from '../data/database.js';

const personajesFilePath = path.resolve('./data/personajes.json');
const data = JSON.parse(fs.readFileSync(personajesFilePath, 'utf8'));
const personajes = data.characters;

const multiplicadores = {
  'Rainbow': 10,
  'Panda': 8,
  'Chile': 6,
  'Empanadas': 5,
  'Tacos': 4,
  'Araña': 3,
  'Agua': 2,
  'Completo': 7,
  'Fuego': 5.5,
  'Mierda': 1,
  'Semen': 0,
  'Sopaipillas': 3.5
};

export const command = 'addefecto';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665'];
  const isOwner = owners.includes(sender.split('@')[0]);
  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }
  
  if (!args.length || !args.join(' ').includes('|')) {
    await sock.sendMessage(from, { text: `
    ❌ Uso: *.addefecto <nombre_personaje> | <efecto1> | <efecto2> ...*
    
Efectos Disponibles:

Rainbow: x10,
Panda: x8,
Chile: x6,
Empanadas: x5,
Tacos: x4
Araña: x3
Agua: x2
Completo: x7
Fuego: x5.5
Mierda: x1
Semen: x0
Sopaipillas: x3.5

` });
    return;
  }

  const [nombreBuscado, ...efectosNombres] = args.join(' ').split('|').map(s => s.trim());
  const personajeOriginal = personajes.find(p => p.nombre.toLowerCase() === nombreBuscado.toLowerCase());

  if (!personajeOriginal) {
    await sock.sendMessage(from, { text: `❌ El personaje *${nombreBuscado}* no se encontró en la lista.` });
    return;
  }
  
  const efectosValidos = efectosNombres.filter(e => multiplicadores[e]);

  if (efectosValidos.length === 0) {
    await sock.sendMessage(from, { text: '❌ No se especificaron efectos válidos. Efectos: ' + Object.keys(multiplicadores).join(', ') });
    return;
  }

  let precioFinal = personajeOriginal.precio;
  let nombreFinal = personajeOriginal.nombre;

  efectosValidos.forEach(efecto => {
    precioFinal *= multiplicadores[efecto];
    nombreFinal += ` *${efecto}*`;
  });

  const nuevoPersonaje = {
    nombre: nombreFinal,
    calidad: personajeOriginal.calidad,
    precio: Math.floor(precioFinal),
    efectos: efectosValidos,
    descripcion: `Versión modificada de ${personajeOriginal.nombre} con efectos.`
  };
  
  personajes.push(nuevoPersonaje);
  guardarPersonajes(personajes);

  await sock.sendMessage(from, { text: `✅ Personaje *${nuevoPersonaje.nombre}* agregado a la lista maestra con efectos. Precio final: ${nuevoPersonaje.precio}.` });
}

