import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'cagar';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const cooldownFile = './data/cooldowns.json';

  if (!fs.existsSync(cooldownFile)) fs.writeFileSync(cooldownFile, '{}');
  const cooldowns = JSON.parse(fs.readFileSync(cooldownFile, 'utf8'));
  const userCooldown = cooldowns[sender]?.cagar || 0;
  const now = Date.now();

  const cooldownMs = 4 * 60 * 1000;
  if (now - userCooldown < cooldownMs) {
    const remainingSeconds = Math.ceil((cooldownMs - (now - userCooldown)) / 1000);
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    let timeString = '';
    if (minutes > 0) timeString += `${minutes} min `;
    timeString += `${seconds} seg`;
    
    await sock.sendMessage(from, { text: `🚽 Tienes que esperar *${timeString}* para volver a cagar.` });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0, exp: 0 };
  
  const randomChance = Math.random() * 100;
  const jackpotChance = 0.4;
  const jackpotAmount = 444444;

  if (randomChance <= jackpotChance) {
    db.users[sender].pandacoins += jackpotAmount;
    guardarDatabase(db);

    await sock.sendMessage(from, { text: `🎉 ¡INCREÍBLE! 🎉 ¡Encontraste un tesoro en el baño y ganaste *${jackpotAmount} pandacoins*! 🤯` });

  } else {
    const messages = [
      '🚽 Dejaste tu alma en el baño.',
      '💩 Tuviste una experiencia normal en el baño.',
      '🧻 Usaste 3 rollos de papel higiénico.',
      '🤢 La comida de ayer te dejó sin aliento.',
      '😌 Vaya, eso fue un gran alivio.'
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    await sock.sendMessage(from, { text: randomMessage });
  }

  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].cagar = now;
  fs.writeFileSync(cooldownFile, JSON.stringify(cooldowns, null, 2));
}

