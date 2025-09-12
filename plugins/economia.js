import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const ownersPermitidos = [
  '56953508566', // Tu número
  '593991944530', // Ejemplo
  '5219513164242', // Ejemplo
  '50589329325' // Ejemplo
];

const recursosValidos = ['coins', 'pandacoins', 'exp', 'piedra', 'diamantes', 'creditos', 'giros'];

function esOwner(userId) {
  return ownersPermitidos.includes(userId);
}

export const command = ['add', 'penalizar'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = (msg.key.participant || msg.key.remoteJid).split('@')[0];

  // Verificar permiso
  if (!esOwner(sender)) {
    await sock.sendMessage(from, { text: '❌ No tienes permisos para usar este comando.' }, { quoted: msg });
    return;
  }

  if (args.length < 3) {
    await sock.sendMessage(from, { text: '📌 Uso: .add <recurso> <cantidad> @usuario\n📌 Uso: .penalizar <recurso> <cantidad> @usuario' }, { quoted: msg });
    return;
  }

  const recurso = args[0].toLowerCase();
  const cantidad = parseInt(args[1]);
  const mencionado = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

  if (!recursosValidos.includes(recurso)) {
    await sock.sendMessage(from, { text: `❌ Recurso no válido. Recursos disponibles: ${recursosValidos.join(', ')}` }, { quoted: msg });
    return;
  }

  if (isNaN(cantidad) || cantidad <= 0) {
    await sock.sendMessage(from, { text: '❌ La cantidad debe ser un número mayor a 0.' }, { quoted: msg });
    return;
  }

  if (!mencionado) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario.' }, { quoted: msg });
    return;
  }

  const targetId = mencionado.split('@')[0];

  // Cargar DB
  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[targetId] = db.users[targetId] || { pandacoins: 0, exp: 0, piedra: 0, diamantes: 0, creditos: 0 };

  global.cmDB = global.cmDB || {};
  global.cmDB[targetId] = global.cmDB[targetId] || { spins: 0, coins: 0 };

  let texto = '';

  if (recurso === 'giros') recursoCM(targetId, 'spins', cantidad, msg, from, sock);
  else if (recurso === 'coins') recursoCM(targetId, 'coins', cantidad, msg, from, sock);
  else {
    if (msg.body.startsWith('.add')) {
      db.users[targetId][recurso] = (db.users[targetId][recurso] || 0) + cantidad;
      texto = `✅ Se añadieron *${cantidad} ${recurso}* a @${targetId}`;
    } else if (msg.body.startsWith('.penalizar')) {
      db.users[targetId][recurso] = Math.max(0, (db.users[targetId][recurso] || 0) - cantidad);
      texto = `⚠️ Se penalizaron *${cantidad} ${recurso}* a @${targetId}`;
    }
    guardarDatabase(db);
    await sock.sendMessage(from, { text: texto, mentions: [mencionado] }, { quoted: msg });
  }
}

function recursoCM(userId, key, cantidad, msg, from, sock) {
  if (msg.body.startsWith('.add')) {
    global.cmDB[userId][key] = (global.cmDB[userId][key] || 0) + cantidad;
    global.guardarCM();
    sock.sendMessage(from, { text: `✅ Se añadieron *${cantidad} ${key}* a @${userId}`, mentions: [`${userId}@s.whatsapp.net`] }, { quoted: msg });
  } else if (msg.body.startsWith('.penalizar')) {
    global.cmDB[userId][key] = Math.max(0, (global.cmDB[userId][key] || 0) - cantidad);
    global.guardarCM();
    sock.sendMessage(from, { text: `⚠️ Se penalizaron *${cantidad} ${key}* a @${userId}`, mentions: [`${userId}@s.whatsapp.net`] }, { quoted: msg });
  }
}
