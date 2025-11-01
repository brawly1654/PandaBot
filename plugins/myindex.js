import fs from 'fs';
import { cargarDatabase } from '../data/database.js';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'myindex';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const db = cargarDatabase();
  const userData = db.users?.[sender] || {};
  const userCharacters = userData.personajes || [];

  const personajesNormales = personajes.filter(p => !p.efectos);

  const personajesPorCalidad = personajesNormales.reduce((acc, personaje) => {
    acc[personaje.calidad] = acc[personaje.calidad] || [];
    acc[personaje.calidad].push(personaje);
    return acc;
  }, {});

  const userNormales = userCharacters
    .map(pName => personajesNormales.find(p => p.nombre === pName))
    .filter(p => p !== undefined);

  const totalNormales = personajesNormales.length;

  let message = `*Índice de Personajes* 📚\n\n`;
  message += `👤 Personajes obtenidos: *${userNormales.length}* de *${totalNormales}*\n\n`;

  for (const calidad in personajesPorCalidad) {
    message += `═══════[ *${calidad}* ]═══════\n`;
    const listaPersonajes = personajesPorCalidad[calidad];
    
    for (const personaje of listaPersonajes) {
      const tienePersonaje = userCharacters.includes(personaje.nombre);
      const estado = tienePersonaje ? '✅️' : '❌';
      message += ` ${estado} ${personaje.nombre}\n`;
    }
    message += `\n`;
  }
  
  message += `_Usa .ps para obtener más personajes._`;

  await sock.sendMessage(from, { text: message });
}

