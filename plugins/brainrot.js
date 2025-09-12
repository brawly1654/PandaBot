import fs from 'fs';
import { brainrots } from '../data/brainrotData.js'; // Archivo donde están los brainrots definidos

const file = './data/brainrot.json';

function loadData() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '{}');
  return JSON.parse(fs.readFileSync(file));
}

function saveData(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export const command = 'brainrot';
export const tags = ['juegos'];
export const help = ['brainrot'];

export async function run(sock, m) {
  const user = m.key.participant || m.key.remoteJid;
  const data = loadData();
  const now = Date.now();

  if (!data[user]) {
    data[user] = {
      dinero: 0,
      brainrots: [],
      ultimoUpdate: now
    };
  }

  // Calcular ganancias pasivas
  let ganancias = 0;
  const minutos = Math.floor((now - data[user].ultimoUpdate) / 60000);

  for (const nombre of data[user].brainrots) {
    const b = brainrots.find(b => b.nombre === nombre);
    if (b) ganancias += b.ganancia * minutos;
  }

  data[user].dinero += ganancias;
  data[user].ultimoUpdate = now;
  saveData(data);

  const msg = `🧠 *Tu Tycoon de Brainrot*\n\n` +
              `💰 Dinero: $${data[user].dinero}\n` +
              `🧠 Brainrots: ${data[user].brainrots.length > 0 ? data[user].brainrots.join(', ') : 'Ninguno'}\n` +
              `⏱️ Ganaste $${ganancias} en ${minutos} minutos`;

  await sock.sendMessage(m.chat, { text: msg }, { quoted: m });
}
