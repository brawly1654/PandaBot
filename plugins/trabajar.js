import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'trabajar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const cooldownFile = './data/cooldowns.json';

  if (!fs.existsSync(cooldownFile)) fs.writeFileSync(cooldownFile, '{}');
  const cooldowns = JSON.parse(fs.readFileSync(cooldownFile, 'utf8'));
  const userCooldown = cooldowns[sender]?.trabajar || 0;
  const now = Date.now();

  const cooldownMs = 5 * 60 * 1000;
  if (now - userCooldown < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - userCooldown)) / 60000);
    await sock.sendMessage(from, { text: `⏳ Debes esperar ${remaining} min para volver a trabajar.` });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0, exp: 0 };
  
  const randomChance = Math.random() * 100;
  const coinsWon = Math.floor(Math.random() * 800) + 2000;
  const expWon = Math.floor(Math.random() * 2000) + 1000;

  const empleadoDelDiaChance = 18;

  const lossChance = 10;
  
  const trabajos = [
    `💼 Trabajaste como ingeniero y ganaste +${coinsWon} pandacoins y +${expWon} de experiencia.`,
    `🙂‍↔️ Trabajaste como perrita de Lukas y ganaste ${coinsWon} PandaCoins y ${expWon} de experiencia.`,
    `😳 Trabajaste como prostituta y ganaste ${coinsWon} PandaCoins y ${expWon} de experiencia.`,
    `😉 Ayudaste a una señora a cruzar la calle y ganaste ${coinsWon} PandaCoins y ${expWon} de experiencia.`,
    `😇 Plantaste árboles para cuidar el planeta y PandaBot te recompensa con ${coinsWon} PandaCoins y +${expWon} de experiencia.`,
    `😋 Fuiste un Empleado de la pizzería de PandaBot por un día y ganaste ${coinsWon} PandaCoins y +${expWon} de experiencia.`,
    `💰 Trabajaste repartiendo paquetes de Mercado Libre y ganaste ${coinsWon} PandaCoins y +${expWon} de experiencia.`,
    `🧠 Ayudaste a agregar contenido a PandaBot y ganaste ${coinsWon} PandaCoins y +${expWon} de experiencia.`
  ];

  const perdidas = [
    `💔 Te encontraron hablando con los Haters de Lukas y perdiste PandaCoins.`,
    `😔 Se te cayeron las PandaCoins en un lago y perdiste PandaCoins.`,
    `🥺 Te robaron el dinero que ganaste y perdiste PandaCoins.`,
    `😭 Se te rompieron las pandacoins y perdiste PandaCoins.`
  ];

  if (randomChance <= empleadoDelDiaChance) {
    const bonusCoins = coinsWon * 2;
    db.users[sender].pandacoins += bonusCoins;
    db.users[sender].exp += expWon;
    await sock.sendMessage(from, { text: `*👑 ¡Felicidades, eres el Empleado del Día! 👑 Por tu esfuerzo, tus ganancias se han duplicado. Ganaste +${bonusCoins} pandacoins y +${expWon} de experiencia.*` });

  } else if (randomChance > empleadoDelDiaChance && randomChance <= empleadoDelDiaChance + (100 - empleadoDelDiaChance - lossChance)) {
    db.users[sender].pandacoins += coinsWon;
    db.users[sender].exp += expWon;
    const mensajeAleatorio = trabajos[Math.floor(Math.random() * trabajos.length)];
    await sock.sendMessage(from, { text: mensajeAleatorio });
    
  } else {
    const coinsLost = Math.floor(Math.random() * 100) + 100;
    db.users[sender].pandacoins -= coinsLost;
    if (db.users[sender].pandacoins < 0) db.users[sender].pandacoins = 0;
    
    const mensajePerdida = perdidas[Math.floor(Math.random() * perdidas.length)];
    await sock.sendMessage(from, { text: mensajePerdida.replace('PandaCoins', `${coinsLost} PandaCoins`) });
  }

  guardarDatabase(db);
  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].trabajar = now;
  fs.writeFileSync(cooldownFile, JSON.stringify(cooldowns, null, 2));
}

