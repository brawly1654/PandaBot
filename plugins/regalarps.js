import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'regalarps';

export async function run(sock, msg, args) {
const from = msg.key.remoteJid;
const sender = msg.key.participant || msg.key.remoteJid;

const db = cargarDatabase();
db.users = db.users || {};
const user = db.users[sender];

if (!user) {
await sock.sendMessage(from, { text: '❌ No estás registrado. Usa .minar para empezar.' });
return;
}

if (args.length < 2) {
await sock.sendMessage(from, { text: '❌ Uso: .regalarps <NombrePersonaje> @usuario' });
return;
}

const personajeNombre = args.slice(0, -1).join(' ').toLowerCase();
const mentionedJid = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

if (!mentionedJid) {
await sock.sendMessage(from, { text: '❌ Debes mencionar al usuario al que deseas regalar el personaje.' });
return;
}

if (mentionedJid === sender) {
await sock.sendMessage(from, { text: '❌ No puedes regalarte un personaje a ti mismo.' });
return;
}

const targetUser = db.users[mentionedJid];
if (!targetUser) {
await sock.sendMessage(from, { text: '❌ El usuario mencionado no está registrado.' });
return;
}

user.personajes = user.personajes || [];
targetUser.personajes = targetUser.personajes || [];

// Buscar personaje en la lista del usuario que regala
const personajeIndex = user.personajes.findIndex(p => p.toLowerCase() === personajeNombre);
if (personajeIndex === -1) {
await sock.sendMessage(from, { text: '❌ No tienes este personaje en tu lista.' });
return;
}

// Transferir personaje
const personajeReal = user.personajes[personajeIndex];
user.personajes.splice(personajeIndex, 1);            // eliminar de tu lista
targetUser.personajes.push(personajeReal);           // agregar al destinatario

guardarDatabase(db);

await sock.sendMessage(from, {
text:` ✅ Regalaste *${personajeReal}* a @${mentionedJid.split('@')[0]}`,
mentions: [mentionedJid]
});
}


