import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { addCoins } from "../PandaLove/pizzeria.js";

const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

export const command = 'ruletarusa';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando solo puede usarse en grupos.' }, { quoted: msg });
    return;
  }

  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];

const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');

  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.ruletarusa || 0;
  const now = Date.now();
  const cooldownTime = 0 * 60 * 1000;

  if (now - lastTime < cooldownTime) {
    const minutesLeft = Math.ceil((cooldownTime - (now - lastTime)) / 60000);
    await sock.sendMessage(from, {
      text: `🕒 *Cooldown activo*\n🎯 Espera *${minutesLeft} minuto(s)* antes de volver a jugar a la ruleta rusa.`
    }, { quoted: msg });
    return;
  }

  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].ruletarusa = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0, personajes: [] };

  global.cmDB = global.cmDB || {};
  global.cmDB[userId] = global.cmDB[userId] || { spins: 0, coins: 0 };

  const resultados = [
    'perder_personajes',
    'ganar_pandacoins',
    'perder_pandacoins',
    'ganar_pizzacoins',
    'perder_pizzacoins',
    'admin_temporal',
    'ganar_tiros',
    'perder_tiros',
    'ganar_ultra'
  ];

  const resultado = resultados[Math.floor(Math.random() * resultados.length)];

  let texto = `🎯 *Ruleta Rusa* 🎯\n\n`;

  switch (resultado) {
    case 'perder_personajes':
      const user = db.users[sender];
      const personajesTotales = user.personajes.length;
      if (personajesTotales > 0) {
        const numPersonajesARemover = Math.min(30, personajesTotales);
        const personajesPerdidos = [];
        for (let i = 0; i < numPersonajesARemover; i++) {
          const randomIndex = Math.floor(Math.random() * user.personajes.length);
          const personajePerdido = user.personajes.splice(randomIndex, 1);
          personajesPerdidos.push(personajePerdido);
        }
        guardarDatabase(db);
        texto += `💀 Perdiste... *¡Has perdido ${numPersonajesARemover} personajes al azar!*`;
      } else {
        texto += `😅 Tuviste suerte, no tenías personajes para perder.`;
      }
      await sock.sendMessage(from, { text: texto });
      break;

    case 'ganar_pandacoins':
      const coinsGanados = Math.floor(Math.random() * 5001) + 5000;
      db.users[sender].pandacoins += coinsGanados;
      texto += `💰 ¡Ganaste *${coinsGanados} Pandacoins*!`;
      guardarDatabase(db);
      await sock.sendMessage(from, { text: texto });
      break;

    case 'perder_pandacoins':
      const coinsPerdidos = Math.floor(Math.random() * 5001) + 4000;
      db.users[sender].pandacoins = Math.max(0, db.users[sender].pandacoins - coinsPerdidos);
      texto += `💸 ¡Perdiste *${coinsPerdidos} Pandacoins*!`;
      guardarDatabase(db);
      await sock.sendMessage(from, { text: texto });
      break;

    case 'ganar_pizzacoins':
      try {
        const coinsGanadosPizzas = Math.floor(Math.random() * 4001) + 1000;
        const response = await addCoins(sender, coinsGanadosPizzas);
        if (response.detail) {
          texto += `❌ Error de la API: ${response.detail}`;
        } else {
          texto += `💰 ¡Ganaste *${coinsGanadosPizzas} PizzaCoins*!`;
        }
      } catch (e) {
        texto += `❌ Hubo un error al conectar con la API de la pizzería.`;
        console.error('❌ Error en ruletarusa (ganar pizzacoins):', e);
      }
      await sock.sendMessage(from, { text: texto });
      break;

    case 'perder_pizzacoins':
      try {
        const coinsPerdidosPizzas = Math.floor(Math.random() * 3001) + 1000;
        const response = await addCoins(sender, -coinsPerdidosPizzas);
        if (response.detail) {
          texto += `❌ Error de la API: ${response.detail}`;
        } else {
          texto += `💸 ¡Perdiste *${coinsPerdidosPizzas} PizzaCoins*!`;
        }
      } catch (e) {
        texto += `❌ Hubo un error al conectar con la API de la pizzería.`;
        console.error('❌ Error en ruletarusa (perder pizzacoins):', e);
      }
      await sock.sendMessage(from, { text: texto });
      break;

    case 'ganar_ultra':
      const ultraList = personajes.filter(p => p.calidad === 'legendario');
      const personajeGanado = ultraList[Math.floor(Math.random() * ultraList.length)];
      db.users[sender].personajes.push(personajeGanado.nombre);
      guardarDatabase(db);
      texto += `🌟 ¡Has ganado un personaje *legendario*: *${personajeGanado.nombre}*!`;
      await sock.sendMessage(from, { text: texto });
      break;
  }
}


