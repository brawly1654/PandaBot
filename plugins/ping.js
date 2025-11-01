export const command = 'ping';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
    const start = new Date().getTime();
await
sock.sendMessage(from, { react: { text: '⌛', key: msg.key }});

    const end = new Date().getTime();

    const latency = end - start;


  await sock.sendMessage(from, {
    text: `Pong! 🏓\nTiempo de respuesta: ${latency} ms`
  }, { quoted: msg });
}

