import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;
const owners = ['56953508566@s.whatsapp.net', '5492996271200@s.whatsapp.net', '573023181375@s.whatsapp.net', '166164298780822@lid'];

export const command = 'drop';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!owners.includes(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  if (!args[0]) {
    await sock.sendMessage(from, { text: '❌ Debes indicar una calidad. Ejemplo: .drop épico o .drop random' });
    return;
  }

  const calidadSolicitada = args[0].toLowerCase();
  let calidadParaDrop;

  if (calidadSolicitada === 'random') {
    // Obtener todas las calidades únicas disponibles
    const calidadesDisponibles = [...new Set(personajes.map(p => p.calidad))];
    // Elegir una calidad al azar
    calidadParaDrop = calidadesDisponibles[Math.floor(Math.random() * calidadesDisponibles.length)];
  } else {
    calidadParaDrop = calidadSolicitada;
  }

  const candidatos = personajes.filter(p => p.calidad.toLowerCase() === calidadParaDrop);

  if (candidatos.length === 0) {
    await sock.sendMessage(from, { text: `❌ No se encontraron personajes con la calidad "${calidadParaDrop}".` });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  
  for (const userId in db.users) {
    const personaje = candidatos[Math.floor(Math.random() * candidatos.length)];
    db.users[userId].personajes = db.users[userId].personajes || [];
    db.users[userId].personajes.push(personaje.nombre);
  }
  
  guardarDatabase(db);
  
  await sock.sendMessage(from, {
    text: `🎁 ¡Drop completado!\nSe entregó 1 personaje *${calidadParaDrop}* a todos los usuarios registrados.`
  });
}

