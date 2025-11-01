import { cargarStock } from './addstock.js';

export const command = 'viewstock';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, {
      text: '❌ Usa `.viewstock <Nombre del personaje>` para consultar el stock.'
    }, { quoted: msg });
    return;
  }

  const nombreInput = args.join(' ').toLowerCase();
  const stock = cargarStock();

  const cantidad = stock[nombreInput];

  if (cantidad === undefined) {
    await sock.sendMessage(from, {
      text: `📦 El personaje *${args.join(' ')}* tiene stock *ilimitado*.`
    }, { quoted: msg });
  } else {
    await sock.sendMessage(from, {
      text: `📦 El personaje *${args.join(' ')}* tiene *${cantidad} unidades* restantes.`
    }, { quoted: msg });
  }
}
