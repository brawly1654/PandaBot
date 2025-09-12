export const command = 'estado';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  await sock.sendMessage(from, { text: '✅ El bot está activo y funcionando correctamente.\n> EASTER EGG DESCUBIERTO: USA .secret' });
}
