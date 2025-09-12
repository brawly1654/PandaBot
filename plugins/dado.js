export const command = 'dado';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const num = Math.floor(Math.random() * 6) + 1;
  const text = `🎲 Has lanzado el dado y salió: *${num}*`;
  await sock.sendMessage(from, { text });
}
