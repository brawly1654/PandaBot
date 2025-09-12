export const command = 'getjid';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (!mentionedJid || mentionedJid.length === 0) {
    await sock.sendMessage(from, { text: '❌ Debes mencionar a un usuario. Ejemplo: .getjid @usuario' });
    return;
  }
  
  const targetJid = mentionedJid[0];
  const responseMessage = `
*--- JID del Usuario ---*

El JID del usuario mencionado es:
\`\`\`
${targetJid}
\`\`\`
`;

  await sock.sendMessage(from, { text: responseMessage }, { quoted: msg });
}

