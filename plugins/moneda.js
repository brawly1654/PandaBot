export const command = 'moneda';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const resultado = Math.random() > 0.5 ? '🪙 Cara' : '🪙 Cruz';
  await sock.sendMessage(from, { text: `La moneda cayó en: *${resultado}*\n> EASTER EGG DESCUBIERTO: USA .secret` });
}
