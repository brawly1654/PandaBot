import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'apostar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const COOLDOWN_MS = 30 * 60 * 1000; // 10 minutos

  // Validación
  if (args.length < 2) {
    await sock.sendMessage(from, { text: '❌ Uso: /apostar <monto> <bajo|medio|alto>' }, { quoted: msg });
    return;
  }

let monto = parseInt(args[0]);
let nivel = args[1].toLowerCase();

if (isNaN(monto) || monto <= 0) {
  await sock.sendMessage(from, { text: '❌ El monto debe ser un número positivo.' }, { quoted: msg });
  return;
}

if (monto > 25000000) {
  await sock.sendMessage(from, {
    text: '❌ El monto máximo permitido para apostar es *25 millones* de Pandacoins.'
  }, { quoted: msg });
  return;
}

  const niveles = {
    bajo: { multiplicador: 1.5, prob: 0.6 },
    medio: { multiplicador: 2, prob: 0.4 },
    alto: { multiplicador: 3, prob: 0.2 }
  };

  if (!niveles[nivel]) {
    await sock.sendMessage(from, { text: '❌ Nivel inválido. Usa: bajo, medio o alto.' }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  db.users[sender] = db.users[sender] || { pandacoins: 0, exp: 0, personajes: [] };

  const ultimo = db.users[sender].ultimoApostar || 0;
  const ahora = Date.now();

  if (ahora - ultimo < COOLDOWN_MS) {
    const restante = COOLDOWN_MS - (ahora - ultimo);
    const minutos = Math.floor(restante / 60000);
    const segundos = Math.floor((restante % 60000) / 1000);
    await sock.sendMessage(from, {
      text: `⏳ Debes esperar *${minutos}m ${segundos}s* antes de volver a apostar.`,
    }, { quoted: msg });
    return;
  }

  if (db.users[sender].pandacoins < monto) {
    await sock.sendMessage(from, { text: '❌ No tienes suficientes Pandacoins.' }, { quoted: msg });
    return;
  }

  const { multiplicador, prob } = niveles[nivel];
  const gana = Math.random() < prob;

  let texto = `🎲 *Apuesta (${nivel})*\n💰 Apostaste: ${monto} Pandacoins\n`;

  if (gana) {
    let ganancia = Math.floor(monto * multiplicador);
    db.users[sender].pandacoins += ganancia;
    texto += `✅ ¡Ganaste! +${ganancia} Pandacoins`;
  } else {
    db.users[sender].pandacoins -= monto;
    texto += `❌ Perdiste la apuesta. -${monto} Pandacoins`;
  }

  db.users[sender].ultimoApostar = ahora;
  guardarDatabase(db);

  await sock.sendMessage(from, { text: texto }, { quoted: msg });
}
