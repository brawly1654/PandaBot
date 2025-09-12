import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'sell';

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

if (!args.length) {
await sock.sendMessage(from, { text: '❌ Usa .sell <NombrePersonaje> para vender un personaje.' });
return;
}

const nombre = args.join(' ').toLowerCase();
const personaje = personajes.find(p => p.nombre.toLowerCase() === nombre);

if (!personaje) {
await sock.sendMessage(from, { text: `❌ Personaje no encontrado. Usa .misps para ver tus personajes.` });
return;
}

user.personajes = user.personajes || [];

if (!user.personajes.includes(personaje.nombre)) {
await sock.sendMessage(from, { text: `❌ No tienes a *${personaje.nombre}* en tu colección.` });
return;
}

// Quitar personaje del usuario
user.personajes = user.personajes.filter(p => p !== personaje.nombre);
user.pandacoins = user.pandacoins || 0;
user.pandacoins += personaje.precio;

if (db.clanes) {
    const clanName = Object.keys(db.clanes).find(nombre =>
      db.clanes[nombre].miembros.includes(sender)
    );
    if (clanName) {
      db.clanes[clanName].recolectados = (db.clanes[clanName].recolectados || 0) + personaje.precio;
    }
  }

guardarDatabase(db);

await sock.sendMessage(from, { text: `✅ Has vendido a *${personaje.nombre}* por ${personaje.precio} pandacoins.` });
}


