import fs from 'fs';
import path from 'path';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'steal';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (!mentionedJid) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario para robar.' }, { quoted: msg });
    return;
  }
  
  if (mentionedJid === sender) {
    await sock.sendMessage(from, { text: '❌ No puedes robarte a ti mismo, eso es un robo con intimidacion.' }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender] || { pandacoins: 0, personajes: [] };
  const targetUser = db.users[mentionedJid] || { pandacoins: 0 };
  
  if (targetUser.pandacoins < 5000) {
    await sock.sendMessage(from, { text: `❌ El usuario mencionado no tiene suficientes pandacoins para robarle. Necesitas que tenga al menos *5,000* pandacoins.` }, { quoted: msg });
    return;
  }

  const cdPath = path.resolve('./data/cooldowns.json');
  if (!fs.existsSync(cdPath)) fs.writeFileSync(cdPath, '{}');
  const cooldowns = JSON.parse(fs.readFileSync(cdPath));
  const lastTime = cooldowns[sender]?.steal || 0;
  const now = Date.now();
  const cooldownTime = 1 * 60 * 60 * 1000;

  if (now - lastTime < cooldownTime) {
    const hoursLeft = Math.ceil((cooldownTime - (now - lastTime)) / 3600000);
    await sock.sendMessage(from, { text: `🕒 *Cooldown activo*\n🔪 Espera *${hoursLeft} hora(s)* antes de volver a robar.` }, { quoted: msg });
    return;
  }
  cooldowns[sender] = cooldowns[sender] || {};
  cooldowns[sender].steal = now;
  fs.writeFileSync(cdPath, JSON.stringify(cooldowns, null, 2));
  
  const exito = Math.random() < 0.5;
  let mensaje = ``;

  if (exito) {
    const coinsRobados = Math.floor(Math.random() * 4001) + 10000;
    user.pandacoins += coinsRobados;
    targetUser.pandacoins -= coinsRobados;
    mensaje = `💰 ¡Robo exitoso! Le robaste *${coinsRobados} Pandacoins* a @${mentionedJid.split('@')[0]}.`;
  } else {
    const multa = Math.floor(Math.random() * 2001) + 1000;
    user.pandacoins = Math.max(0, user.pandacoins - multa);
    mensaje = `🚨 ¡Robo fallido! La policía te atrapó y tuviste que pagar una multa de *${multa} Pandacoins*.`;
  }

  guardarDatabase(db);
  await sock.sendMessage(from, { text: mensaje, mentions: [mentionedJid] }, { quoted: msg });
}

