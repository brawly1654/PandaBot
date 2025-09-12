export const command = 'ping';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const latency = Math.floor(Math.random() * 101);

  await sock.sendMessage(from, {
    text: `Pong! 🏓\nTiempo de respuesta: ${latency} ms`
  });
}
