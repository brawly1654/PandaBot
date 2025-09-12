import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js'; // Asegúrate de tener este archivo y función

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

export const command = 'dropvip';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }

  const db = cargarDatabase();
  const user = db.users[sender];
  
  user.cooldowns = user.cooldowns || {};
  const now = Date.now();
  const cooldownTime = 12 * 60 * 60 * 1000; // 12 horas
  
  if (now - (user.cooldowns.dropvip || 0) < cooldownTime) {
    const timeLeft = cooldownTime - (now - (user.cooldowns.dropvip || 0));
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    await sock.sendMessage(from, { text: `⏳ Debes esperar ${hours}h ${minutes}m para volver a usar .dropvip.` });
    return;
  }

  const candidatos = personajes.filter(p => ['épico', 'mítico', 'legendario', 'Ultra-Legendario'].includes(p.calidad));
  
  if (candidatos.length === 0) {
    await sock.sendMessage(from, { text: '❌ No hay personajes épicos o superiores disponibles para el drop.' });
    return;
  }
  
  const personajeGanado = candidatos[Math.floor(Math.random() * candidatos.length)];
  user.personajes.push(personajeGanado.nombre);
  user.cooldowns.dropvip = now;
  guardarDatabase(db);
  
  await sock.sendMessage(from, { text: `🎁 ¡Felicidades, usuario VIP! Has obtenido un personaje *${personajeGanado.calidad}*: *${personajeGanado.nombre}*` });
}

