export const command = 'lol';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  await sock.sendMessage(from, { text: 'https://chat.whatsapp.com/HtOJsuuxkHp3bVxu33UVIX?mode=ac_t' });
}





