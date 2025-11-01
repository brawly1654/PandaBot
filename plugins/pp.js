export const command = 'pp'

export async function run(sock, msg, args){
const from = msg.key.remoteJid
const tamaño = '8' + '='.repeat(Math.floor(Math.random() * 10)) + 'D';
await sock.sendMessage(from, { text: `🍆 Tamaño: ${tamaño}` }, { quoted: msg });
}
