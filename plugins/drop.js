import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;
const owners = ['56953508566@s.whatsapp.net', '5492996271200@s.whatsapp.net', '573023181375@s.whatsapp.net', '166164298780822@lid', '5215538830665@s.whatsapp.net'];

export const command = 'drop';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!owners.includes(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  if (!args[0]) {
    await sock.sendMessage(from, { text: '❌ Debes indicar una calidad, "random" o el nombre de un personaje.' });
    return;
  }

  const nombreBuscado = args.join(' ').toLowerCase();
  let personajeADropear;
  let tipoDeDrop = 'calidad';

  const personajeEspecifico = personajes.find(p => p.nombre.toLowerCase() === nombreBuscado);
  if (personajeEspecifico) {
    personajeADropear = personajeEspecifico;
    tipoDeDrop = 'especifico';
  }
  else {
    const calidadSolicitada = args[0].toLowerCase();
    let candidatos;
    
    if (calidadSolicitada === 'random') {
      candidatos = personajes;
      tipoDeDrop = 'random';
    } else {
      candidatos = personajes.filter(p => p.calidad.toLowerCase() === calidadSolicitada);
    }

    if (candidatos.length === 0) {
      await sock.sendMessage(from, { text: `❌ No se encontraron personajes con esa calidad.` });
      return;
    }

    personajeADropear = candidatos[Math.floor(Math.random() * candidatos.length)];
  }

  const db = cargarDatabase();
  db.users = db.users || {};

  for (const userId in db.users) {
    db.users[userId].personajes = db.users[userId].personajes || [];
    db.users[userId].personajes.push(personajeADropear.nombre);
  }

  guardarDatabase(db);

  let mensajeFinal;
  if (tipoDeDrop === 'especifico') {
    mensajeFinal = `🎁 ¡Drop completado!\nSe entregó el personaje *${personajeADropear.nombre}* a todos los usuarios registrados.`;
  } else if (tipoDeDrop === 'random') {
    mensajeFinal = `🎁 ¡Drop completado!\nSe entregó 1 personaje al azar a todos los usuarios registrados.`;
  } else {
    mensajeFinal = `🎁 ¡Drop completado!\nSe entregó un personaje *${personajeADropear.calidad}* a todos los usuarios registrados.`;
  }

  await sock.sendMessage(from, {
    text: mensajeFinal
  });
}

