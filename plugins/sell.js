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

  const COOLDOWN_MS = 0 * 60 * 1000;
  const ahora = Date.now();
  const ultimoSell = user.ultimoSell || 0;

  if (ahora - ultimoSell < COOLDOWN_MS) {
    const restante = COOLDOWN_MS - (ahora - ultimoSell);
    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);
    await sock.sendMessage(from, {
      text: `⏳ Debes esperar *${minutos}m ${segundos}s* antes de volver a vender.`,
    }, { quoted: msg });
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

  // 🚫 BLOQUEO DE VENTA DEL LUCKY BLOCK
  if (personaje.nombre.toLowerCase() === "spooky lucky block") {
    await sock.sendMessage(from, { text: `🎃 ❌ No puedes vender el *Spooky Lucky Block*.` });
    return;
  }

  user.personajes = user.personajes || [];

  if (!user.personajes.includes(personaje.nombre)) {
    await sock.sendMessage(from, { text: `❌ No tienes a *${personaje.nombre}* en tu colección.` });
    return;
  }

  const index = user.personajes.indexOf(personaje.nombre);
  if (index !== -1) user.personajes.splice(index, 1);

  user.pandacoins = user.pandacoins || 0;
  user.pandacoins += personaje.precio;

  user.ultimoSell = ahora;

  // Si pertenece a un clan, sumar puntos
  if (db.clanes) {
    const clanName = Object.keys(db.clanes).find(nombre =>
      db.clanes[nombre].miembros.includes(sender)
    );
    if (clanName) {
      db.clanes[clanName].recolectados = (db.clanes[clanName].recolectados || 0) + personaje.precio;
    }
  }

  guardarDatabase(db);

  await sock.sendMessage(from, {
    text: `✅ Has vendido a *${personaje.nombre}* por ${personaje.precio} pandacoins.`
  });
}
