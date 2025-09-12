export const command = 'hola';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const message = `¡Hola!, ¿qué tal? Usa .menu para ver mis funciones.`;
  
  await sock.sendMessage(from, { text: message, mentions: [sender] });
}

