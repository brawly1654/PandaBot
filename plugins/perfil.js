import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { obtenerPizzeria } from '../PandaLove/pizzeria.js';
import { isVip } from '../utils/vip.js';

const file = './data/parejas.json';

function cargarParejas() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

export const command = 'perfil';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const targetUserJid = mentionedJid || sender;
  const targetUserId = targetUserJid.split('@')[0];

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[targetUserJid] || { 
    pandacoins: 0, exp: 0, personajes: [], 
    salud: 100, last_activity: 0, adCount: 0 
  };

  if (!db.users[targetUserJid]) {
      await sock.sendMessage(from, { text: '❌ El usuario no está registrado en el bot.' });
      return;
  }

  const parejas = cargarParejas();
  const pareja = parejas[targetUserJid];

  global.cmDB = global.cmDB || {};
  global.cmDB[targetUserId] = global.cmDB[targetUserId] || { spins: 0, coins: 0, creditos: 0 };
  const cmData = global.cmDB[targetUserId];

  const allUsers = Object.keys(db.users);
  const userRank = allUsers.indexOf(targetUserJid) + 1;
  const totalUsers = allUsers.length;

  let vipStatus = '❌ *No es VIP*';
  const now = Date.now();
  if (user.vip && now < user.vipExpiration) {
    const timeLeft = user.vipExpiration - now;
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    vipStatus = `✅ *VIP* (Tiempo restante: ${hours}h ${minutes}m)`;
  } else if (user.vip) {
    user.vip = false;
    delete user.vipExpiration;
    guardarDatabase(db);
  }

  let pizzeriaData = null;
  let pizzeriaError = null;
  try {
    const response = await obtenerPizzeria(targetUserJid);
    if (response.detail) {
      pizzeriaError = response.detail;
    } else {
      pizzeriaData = response;
    }
  } catch (e) {
    pizzeriaError = 'Error de conexión con la API.';
  }

  let estado = '💔 *Soltero/a*';
  let mentions = [targetUserJid];

  if (pareja) {
    estado = `💖 *Casado/a con:* @${pareja.split('@')[0]}`;
    mentions.push(pareja);
  }

  const isSenderVip = isVip(sender);
  const isTargetVip = isVip(targetUserJid);
  const isSpecialProfile = isSenderVip || isTargetVip;
  
  let header = `╭───${isSpecialProfile ? '👑 Perfil VIP' : '👤 Tu Perfil'} ───`;
  let footer = '╰───────────────────';
  
  let mensaje = `${header}
│✨ *Usuario:* @${targetUserId}
│🗓️ *Antigüedad:* Usuario #${userRank} de ${totalUsers}
│💍 *Estado:* ${estado}
│
│👑 *VIP:* ${vipStatus}
${footer}
`;

  mensaje += `
╭───🐼 *PandaBot RPG* ───
│💰 *Pandacoins:* ${Number(user.pandacoins).toFixed(2)}
│🌟 *Experiencia:* ${user.exp}
│🛡️ *Personajes:* ${user.personajes?.length || 0}
│
│👀 *Anuncios Vistos:* ${user.adCount || 0}
╰───────────────────
`;

  mensaje += `
╭───🎲 *Coin Master Stats* ───
│🎰 *Tiros:* ${cmData.spins}
│🪙 *Coins CM:* ${cmData.coins}
│💳 *Créditos:* ${cmData.creditos}
╰───────────────────────
`;

  if (pizzeriaData) {
    mensaje += `
╭───🍕 *Pizzería PandaLove* ───
│✨ *Nombre:* ${pizzeriaData.nombre_pizzeria}
│📈 *Nivel:* ${pizzeriaData.local_level}
│💸 *PizzaCoins:* ${Number(pizzeriaData.coins).toFixed(2)}
╰───────────────────────
`;
  } else {
    mensaje += `
╭───🍕 *Pizzería PandaLove* ───
│❌ ${pizzeriaError || 'No tienes una pizzería registrada.'}
╰───────────────────────
`;
  }

  await sock.sendMessage(from, {
    text: mensaje.trim(),
    mentions
  });
}

