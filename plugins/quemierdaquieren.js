export const command = 'quemierdaquieren';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const message = `que mierda quierennnn me están llenando los mensajes con sus notificaciones de mierda boludo la puta madre lleno de mensajes con el pandabot y ahora me vienen a etiquetar la concha de mi hermana de la puta madre que lo re puta re mil parió`;
  
  await sock.sendMessage(from, { text: message, mentions: [sender] });
}

