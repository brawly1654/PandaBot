import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

const ownersPermitidos = [
  '56953508566',
  '5219513164242',
  '50589329325',
  '166164298780822'
];

const recursosValidos = ['coins', 'pandacoins', 'exp', 'piedra', 'diamantes', 'creditos', 'giros'];

function esOwner(userId) {
  return ownersPermitidos.includes(userId);
}

export const command = 'penalizar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const sender = senderJid.split('@')[0];

  if (!esOwner(sender)) {
    await sock.sendMessage(from, { text: '❌ No tienes permisos para usar este comando.' }, { quoted: msg });
    return;
  }

  if (args.length < 3) {
    await sock.sendMessage(from, { text: '📌 Uso: .penalizar <recurso> <cantidad> @usuario' }, { quoted: msg });
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
  const targetJid = `${targetId}@s.whatsapp.net`;

  // === Inicializar DB igual que ruletarusa ===
  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[targetJid] = db.users[targetJid] || { pandacoins: 0, exp: 0, piedra: 0, diamantes: 0, creditos: 0, personajes: [] };

  global.cmDB = global.cmDB || {};
  global.cmDB[targetId] = global.cmDB[targetId] || { spins: 0, coins: 0 };

  // === Restar recurso ===
  if (recurso === 'giros') {
    global.cmDB[targetId].spins = Math.max(0, global.cmDB[targetId].spins - cantidad);
    global.guardarCM();
  } else if (recurso === 'coins') {
    global.cmDB[targetId].coins = Math.max(0, global.cmDB[targetId].coins - cantidad);
    global.guardarCM();
  } else {
    db.users[targetJid][recurso] = Math.max(0, (db.users[targetJid][recurso] || 0) - cantidad);
    guardarDatabase(db);
  }

  await sock.sendMessage(from, { text: `⚠️ Se penalizaron *${cantidad} ${recurso}* a @${targetId}`, mentions: [mencionado] }, { quoted: msg });
}
