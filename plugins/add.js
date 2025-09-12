import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { addCoins } from "../PandaLove/pizzeria.js";

const ownersPermitidos = [
  '56953508566',
  '5219513164242',
  '50589329325',
  '5215538830665',
  '166164298780822',
  '230004726169681'
];

const recursosValidos = ['coins', 'pandacoins', 'exp', 'piedra', 'diamantes', 'creditos', 'giros', 'pizzacoins'];

function esOwner(userId) {
  return ownersPermitidos.includes(userId);
}

export const command = 'add';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const sender = senderJid.split('@')[0];

  if (!esOwner(sender)) {
    await sock.sendMessage(from, { text: '❌ No tienes permisos para usar este comando.' }, { quoted: msg });
    return;
  }

  if (args.length < 3) {
    await sock.sendMessage(from, { text: '📌 Uso: .add <recurso> <cantidad> @usuario' }, { quoted: msg });
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

  let finalMessage = '';

  try {
    if (recurso === 'pizzacoins') {
      const response = await addCoins(targetJid, cantidad);
      if (response.detail) {
        finalMessage = `❌ Error de la API: ${response.detail}`;
      } else {
        finalMessage = `✅ Se añadieron *${cantidad} PizzaCoins* a @${targetId}`;
      }
    } else if (recurso === 'giros') {
      global.cmDB[targetId].spins += cantidad;
      global.guardarCM();
      finalMessage = `✅ Se añadieron *${cantidad} ${recurso}* a @${targetId}`;
    } else if (recurso === 'coins') {
      global.cmDB[targetId].coins += cantidad;
      global.guardarCM();
      finalMessage = `✅ Se añadieron *${cantidad} ${recurso}* a @${targetId}`;
    } else {
      const db = cargarDatabase();
      db.users = db.users || {};
      db.users[targetJid] = db.users[targetJid] || { pandacoins: 0, exp: 0, piedra: 0, diamantes: 0, creditos: 0, personajes: [] };
      db.users[targetJid][recurso] = (db.users[targetJid][recurso] || 0) + cantidad;
      guardarDatabase(db);
      finalMessage = `✅ Se añadieron *${cantidad} ${recurso}* a @${targetId}`;
    }

    await sock.sendMessage(from, { text: finalMessage, mentions: [mencionado] }, { quoted: msg });

  } catch (e) {
    console.error('❌ Error en el comando .add:', e);
    await sock.sendMessage(from, { text: `❌ Error al procesar la solicitud.`, mentions: [mencionado] }, { quoted: msg });
  }
}

