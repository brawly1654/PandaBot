export const command = 'contacto';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:PandaBot\nORG:Grupo Oficial;\nTEL;type=CELL;type=VOICE;waid=${sender.split('@')[0]}:+${sender.split('@')[0]}\nEND:VCARD`;

  await sock.sendMessage(from, {
    contacts: {
      displayName: 'PandaBot',
      contacts: [{ vcard }]
    }
  });
}

