export const command = 'hola'

export async function run(sock, msg, args){
const from = msg.key.remoteJid;
await sock.sendMessage(from, { text: 'hola, usa .menu'});
}
