export const command = 'chuparpata';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  if (!from.endsWith('@g.us')) {
    await sock.sendMessage(from, { text: '❌ Este comando solo funciona en grupos.' });
    return;
  }
  
  let targetJid;
  let text = '';
  
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedParticipant = msg.message?.extendedTextMessage?.contextInfo?.participant;
  
  if (mentionedJid) {
    targetJid = mentionedJid;
  } else if (quotedMsg && quotedParticipant) {
    targetJid = quotedParticipant;
  } else {
    targetJid = sender;
  }
  
  if (targetJid === sender && !mentionedJid && !quotedMsg) {
      targetJid = from;
  }

  const senderName = msg.pushName || sender.split('@')[0];
  const targetName = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ? msg.pushName : (await sock.getName(targetJid) || targetJid.split('@')[0]);

  const gifs = [
    'https://files.catbox.moe/zuwr3w.mp4',
    'https://files.catbox.moe/vkllyl.mp4',
    'https://files.catbox.moe/es3aji.mp4'
  ];
  const gif = gifs[Math.floor(Math.random() * gifs.length)];
  
  let message;
  if (mentionedJid || quotedMsg) {
    message = `\`${senderName}\` está chupando la pata de \`${targetName}\`. 🥵 🦶`;
  } else {
    message = `\`${senderName}\` está chupando patas por aqui🥵.`;
  }

  try {
    await sock.sendMessage(from, {
      react: { text: '👣', key: msg.key }
    });

    await sock.sendMessage(from, {
      video: { url: gif },
      gifPlayback: true,
      caption: message,
      mentions: [targetJid]
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "✅", key: msg.key }
    });
    
  } catch (err) {
    console.error("❌ Error en chuparpata:", err);
    await sock.sendMessage(from, {
      react: { text: "❌", key: msg.key }
    });
  }
}

