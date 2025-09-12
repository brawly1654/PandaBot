import fs from 'fs';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'cofre';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const cdFile = './data/cooldowns.json';
  if (!fs.existsSync(cdFile)) fs.writeFileSync(cdFile, '{}');

  const cds = JSON.parse(fs.readFileSync(cdFile));
  const last = cds[sender]?.cofre || 0;
  const now = Date.now();
  const cd = 60 * 60 * 1000; // 1 hora

  if (now - last < cd) {
    const m = Math.ceil((cd - (now - last)) / 60000);
    await sock.sendMessage(from, { text: `⏳ Espera ${m} min para abrir otro cofre.` }, { quoted: msg });
    return;
  }

  const db = cargarDatabase();
  db.users[sender] = db.users[sender] || { pandacoins: 0, exp: 0 };

  // Definir probabilidades y recompensas
  const cofres = [
    { tipo: 'Común', prob: 50, minCoins: 700, maxCoins: 1200, minExp: 20, maxExp: 40 },
    { tipo: 'Raro', prob: 30, minCoins: 1300, maxCoins: 2500, minExp: 40, maxExp: 80 },
    { tipo: 'Épico', prob: 15, minCoins: 5000, maxCoins: 7000, minExp: 100, maxExp: 200 },
    { tipo: 'Legendario', prob: 5, minCoins: 7500, maxCoins: 15000, minExp: 200, maxExp: 400 }
  ];

  // Elegir cofre según probabilidad
  const random = Math.random() * 100;
  let acumulado = 0;
  let elegido = cofres[0];
  for (const cofre of cofres) {
    acumulado += cofre.prob;
    if (random <= acumulado) {
      elegido = cofre;
      break;
    }
  }

  // Calcular recompensas
  const coins = elegido.minCoins + Math.floor(Math.random() * (elegido.maxCoins - elegido.minCoins + 1));
  const exp = elegido.minExp + Math.floor(Math.random() * (elegido.maxExp - elegido.minExp + 1));

  // Aplicar recompensas
  db.users[sender].pandacoins += coins;
  db.users[sender].exp += exp;
  guardarDatabase(db);

  // Guardar cooldown
  cds[sender] = cds[sender] || {};
  cds[sender].cofre = now;
  fs.writeFileSync(cdFile, JSON.stringify(cds, null, 2));

  await sock.sendMessage(from, {
    text: `🎁 Abriste un *cofre ${elegido.tipo}*!\n\n+💰 ${coins} pandacoins\n+⭐ ${exp} exp`,
  }, { quoted: msg });
}
