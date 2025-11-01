export const command = 'toplindos';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    await sock.sendMessage(from, { text: '❌ Este comando solo puede ser usado en grupos.' });
    return;
  }
  
  try {
    const metadata = await sock.groupMetadata(from);
    let participants = metadata.participants.map(p => p.id);

    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    
    const top10 = participants.slice(0, 10);
    
    let message = '👑 *TOP 10 DE PERSONAS LINDAS* 👑\n\n';
    message += '¡Aquí están los más lindos del grupo según el bot!\n\n';
    
    let mentions = [];
    top10.forEach((userJid, index) => {
      message += `${index + 1}. ✨ @${userJid.split('@')[0]}\n`;
      mentions.push(userJid);
    });

    await sock.sendMessage(from, { text: message, mentions: mentions }, { quoted: msg });
    
  } catch (error) {
    console.error('❌ Error en el comando toplindos:', error);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el ranking.' });
  }
}

