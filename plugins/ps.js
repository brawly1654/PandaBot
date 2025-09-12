import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

import { guardarPersonajes } from '../data/database.js';

const data = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = data.characters;

export const command = 'ps';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender];

  if (!user) {
    await sock.sendMessage(from, { text: '❌ No estás registrado. Usa el comando .minar para empezar.' });
    return;
  }

  const now = Date.now();
  user.cooldowns = user.cooldowns || {};
  const lastPs = user.cooldowns.ps || 0;
  const diff = now - lastPs;

  if (diff < 1 * 60 * 60 * 1000) {
    const horasRestantes = Math.ceil((1 * 60 * 60 * 1000 - diff) / (60 * 60 * 1000));
    await sock.sendMessage(from, { text: `⏳ Debes esperar ${horasRestantes} hora(s) para volver a usar .ps` });
    return;
  }

  const prob = Math.random();
  let rango = 'común';
  if (prob > 0.995) rango = 'Ultra-Legendario';
  else if (prob > 0.98) rango = 'legendario';
  else if (prob > 0.94) rango = 'mítico';
  else if (prob > 0.85) rango = 'épico';
  else if (prob > 0.7) rango = 'raro';

  const candidatos = personajes.filter(p => p.calidad === rango);
  let personajeGanado;

  if (candidatos.length > 0) {
    personajeGanado = candidatos[Math.floor(Math.random() * candidatos.length)];
  } else {
    personajeGanado = personajes[Math.floor(Math.random() * personajes.length)];
  }

  const efectos = [];
  let precioFinal = personajeGanado.precio;
  const descripcionOriginal = personajeGanado.descripcion;

  const probEfectos = {
    'Rainbow': 0.001, // 0.1%
    'Glitch': 0.002,  // 0.2%
    'Lava': 0.003,    // 0.3%
    'Chicle': 0.005,  // 0.5%
    'Tacos': 0.008,   // 0.8%
    'Araña': 0.01     // 1%
  };

  const multiplicadores = {
    'Rainbow': 10,
    'Glitch': 8,
    'Lava': 6,
    'Chicle': 5,
    'Tacos': 4,
    'Araña': 3
  };

  for (const efecto in probEfectos) {
    if (Math.random() < probEfectos[efecto]) {
      efectos.push(efecto);
      precioFinal *= multiplicadores[efecto];
    }
  }

  let nombreFinal = personajeGanado.nombre;
  if (efectos.length > 0) {
    const nuevoPersonaje = {
      nombre: `${nombreFinal} *${efectos.join('* *')}*`,
      calidad: personajeGanado.calidad,
      precio: Math.floor(precioFinal),
      efectos: efectos,
      descripcion: descripcionOriginal
    };
    personajes.push(nuevoPersonaje);
    guardarPersonajes(personajes);
    nombreFinal = nuevoPersonaje.nombre;
  }

  user.personajes = user.personajes || [];
  user.personajes.push(nombreFinal);
  user.cooldowns.ps = now;

  guardarDatabase(db);

  await sock.sendMessage(from, { text: `🎉 ¡Has obtenido a *${nombreFinal}* (${personajeGanado.calidad}) gratis!\n\n ¡Mira un anuncio a cambio de PandaCoins!\n Usa .get pandacoins y mira los anuncios para conseguir tu recompensa.` });
}

