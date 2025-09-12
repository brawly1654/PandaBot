import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'mejorarps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa .registrar para empezar.' });
    return;
  }

  if (args.length < 1) {
    await sock.sendMessage(from, { text: '❌ Uso: .mejorarps <NombrePersonaje>' });
    return;
  }

  const personajeNombre = args.join(' ').toLowerCase();
  const personajesBase = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8')).characters;

  let pjIndex = user.personajes.findIndex(p =>
    (typeof p === 'string' && p.toLowerCase() === personajeNombre) ||
    (typeof p === 'object' && p.nombre.toLowerCase() === personajeNombre)
  );

  if (pjIndex === -1) {
    await sock.sendMessage(from, { text: '❌ No tienes este personaje.' });
    return;
  }

  let pjUser = user.personajes[pjIndex];

  // Si es string, convertirlo a objeto con nivel
  if (typeof pjUser === 'string') {
    const pBase = personajesBase.find(p => p.nombre.toLowerCase() === pjUser.toLowerCase());
    if (!pBase) {
      await sock.sendMessage(from, { text: '❌ No se encontró información del personaje.' });
      return;
    }
    pjUser = { nombre: pBase.nombre, nivel: 0, precio: pBase.precio, calidad: pBase.calidad };
    user.personajes[pjIndex] = pjUser;
  }

  const costo = Math.floor(pjUser.precio * 1.5);

  if (user.pandacoins < costo) {
    await sock.sendMessage(from, { text: `❌ No tienes suficientes Pandacoins. Necesitas ${costo}.` });
    return;
  }

  user.pandacoins -= costo;
  pjUser.nivel = (pjUser.nivel || 0) + 1;
  pjUser.precio = costo; // Nuevo precio tras mejora

  guardarDatabase(db);

  await sock.sendMessage(from, {
    text: `✅ Mejoraste *${pjUser.nombre}* a nivel ${pjUser.nivel}. Nuevo precio: ${pjUser.precio} Pandacoins.`
  });
}
