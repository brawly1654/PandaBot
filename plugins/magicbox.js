import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js';

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

export const command = 'magicbox';

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
  const cooldownTime = 48 * 60 * 60 * 1000; // 48 horas
  
  if (now - (user.cooldowns.magicbox || 0) < cooldownTime) {
    const timeLeft = cooldownTime - (now - (user.cooldowns.magicbox || 0));
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    await sock.sendMessage(from, { text: `⏳ Debes esperar ${hours} horas para volver a abrir la caja mágica.` });
    return;
  }
  
  const premios = [
    { type: 'pandacoins', value: Math.floor(Math.random() * 20000) + 10000 },
    { type: 'legendario', value: null },
    { type: 'creditos', value: Math.floor(Math.random() * 10) + 5 }
  ];
  
  const premio = premios[Math.floor(Math.random() * premios.length)];
  let message = '✨ ¡Has abierto una *Caja Mágica VIP*! ✨\n\n';

  switch (premio.type) {
    case 'pandacoins':
      user.pandacoins = (user.pandacoins || 0) + premio.value;
      message += `💰 ¡Ganaste *${premio.value} pandacoins*!`;
      break;
    case 'legendario':
      const legendarios = personajes.filter(p => p.calidad === 'legendario' || p.calidad === 'Ultra-Legendario');
      if (legendarios.length > 0) {
        const personajeGanado = legendarios[Math.floor(Math.random() * legendarios.length)];
        user.personajes.push(personajeGanado.nombre);
        message += `🌟 ¡Ganaste un personaje *${personajeGanado.calidad}*: *${personajeGanado.nombre}*!`;
      } else {
        message += '❌ No hay personajes legendarios o ultra-legendarios disponibles.';
      }
      break;
    case 'creditos':
      user.creditos = (user.creditos || 0) + premio.value; // Asume que tienes una propiedad 'creditos'
      message += `💎 ¡Ganaste *${premio.value} créditos*!`;
      break;
  }
  
  user.cooldowns.magicbox = now;
  guardarDatabase(db);
  
  await sock.sendMessage(from, { text: message });
}

