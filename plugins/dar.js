export const command = 'dar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const quotedMessage = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedJid = msg.message?.extendedTextMessage?.contextInfo?.participant;
  const senderJid = msg.key.participant || msg.key.remoteJid;

  if (!quotedMessage) {
    await sock.sendMessage(from, { text: '❌ Debes citar un mensaje para usar este comando.' });
    return;
  }
  
  if (quotedJid === senderJid) {
    await sock.sendMessage(from, { text: '❌ No te puedes hacer eso a ti mismo. ¿Estás bien?' });
    return;
  }

  const actionText = args.join(' ');
  const quotedNumber = quotedJid.split('@')[0];
  
  const responseText = `Le diste ${actionText} a @${quotedNumber} 😳`;
  
  await sock.sendMessage(from, { text: responseText, mentions: [quotedJid] });
}

