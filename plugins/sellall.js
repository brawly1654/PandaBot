import { cargarDatabase, guardarDatabase } from '../data/database.js';
import fs from 'fs';
import { isVip } from '../utils/vip.js';
const personajesData = JSON.parse(fs.readFileSync('./data/personajes.json', 'utf8'));
const personajes = personajesData.characters;

export const command = '.......';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

    if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }
  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender] || {};

  user.personajes = user.personajes || [];

  if (user.personajes.length === 0) {
    await sock.sendMessage(from, {
      text: '❌ No tienes personajes para vender.'
    }, { quoted: msg });
    return;
  }

  let totalGanado = 0;
  let vendidos = 0;

  for (const nombre of user.personajes) {
    const base = personajes.find(p => nombre.startsWith(p.nombre));
    if (!base) continue;

    const efectos = nombre.replace(base.nombre, '').trim().split(' ').filter(e => e);
    let precio = base.precio;

    for (const efecto of efectos) {
      const multiplicador = getMultiplicador(efecto);
      if (multiplicador) precio *= multiplicador;
    }

    totalGanado += Math.floor(precio);
    vendidos++;
  }

  user.pandacoins = (user.pandacoins || 0) + totalGanado;
  user.personajes = [];
  guardarDatabase(db);

  await sock.sendMessage(from, {
    text: `✅ Vendiste *${vendidos} personajes* por un total de *${totalGanado} pandacoins*.`
  }, { quoted: msg });
}

function getMultiplicador(emoji) {
  const tabla = {
  '🌈': 8, '👾': 5, '🇨🇱': 3, '🍬': 2, '🌮': 1.5, '🕷': 1.3,
  '💧': 1.1, '🫓': 1.5, '🌭': 2, '💤': 0.5, '💀': 1.5, '🚽': 14,
  '🇧🇷': 2, '🇨🇴': 2, '☯️': 2.5, '💩': 0.1
  };
  return tabla[emoji] || null;
}
