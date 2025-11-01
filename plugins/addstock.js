import fs from 'fs';
import { ownerNumber } from '../config.js';

const stockFile = './data/stock.json';

export function cargarStock() {
  if (!fs.existsSync(stockFile)) fs.writeFileSync(stockFile, '{}');
  return JSON.parse(fs.readFileSync(stockFile));
}

export function guardarStock(data) {
  fs.writeFileSync(stockFile, JSON.stringify(data, null, 2));
}

export const command = 'addstock';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderId = sender.split('@')[0];

  if (!ownerNumber.includes(`+${senderId}`)) {
    await sock.sendMessage(from, {
      text: '❌ Este comando solo puede ser usado por los owners.'
    }, { quoted: msg });
    return;
  }

  const cantidad = parseInt(args[0]);
  const nombre = args.slice(1).join(' ').toLowerCase();

  if (isNaN(cantidad) || cantidad < 0 || !nombre) {
    await sock.sendMessage(from, {
      text: '❌ Uso incorrecto. Ejemplo: `.addstock 5 Pikachu`'
    }, { quoted: msg });
    return;
  }

  const stock = cargarStock();
  stock[nombre] = cantidad;
  guardarStock(stock);

  await sock.sendMessage(from, {
    text: `✅ Se ha definido un stock de *${cantidad}* unidades para *${nombre}*.`
  }, { quoted: msg });
}
