import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const owners = ['56953508566@s.whatsapp.net', '573023181375@c.us', '166164298780822@lid'];

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'añadirps';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (!owners.includes(sender)) {
    await sock.sendMessage(from, { text: '❌ Solo los owners pueden usar este comando.' });
    return;
  }

  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
  if (!mentioned || mentioned.length === 0 || args.length < 2) {
    await sock.sendMessage(from, { text: '❌ Uso correcto: .añadirps @usuario <NombreDelPersonaje>' });
    return;
  }

  const target = mentioned[0];
  const nombrePersonaje = args.slice(1).join(' ').toLowerCase();
  const personaje = personajes.find(p => p.nombre.toLowerCase() === nombrePersonaje);

  if (!personaje) {
    await sock.sendMessage(from, { text: '❌ Personaje no encontrado en la lista.' });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[target] = db.users[target] || {};
  user.personajes = user.personajes || [];

  // Verificar si el personaje ya está asignado
//  const personajeYaComprado = Object.values(db.users).some(u => (u.personajes || []).includes(personaje.nombre));
 // if (personajeYaComprado) {
   // await sock.sendMessage(from, { text: `❌ El personaje *${personaje.nombre}* ya fue adquirido por otro usuario.` });
   // return;
  //}

  user.personajes.push(personaje.nombre);
  guardarDatabase(db);

  await sock.sendMessage(from, {
    text: `✅ Se le otorgó el personaje *${personaje.nombre}* a @${target.split('@')[0]}`,
    mentions: [target]
  });
}
