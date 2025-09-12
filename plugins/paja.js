export const command = 'paja';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const who = sender;
  const m = msg;

  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const target = mentioned || who;
  const name = mentioned ? `@${mentioned.split('@')[0]}` : `@${who.split('@')[0]}`;

  const frames = [
    `Iniciando paja...`,
    '╭━━╮╭╭╭╮\n┃▔╲┣╈╈╈╈━━━╮\n┃┈┈▏.╰╯╯╯╭╮━┫\n┃┈--.╭━━━━╈╈━╯\n╰━━╯-.                ╰╯',
    '╭━━╮.    ╭╭╭╮\n┃▔╲┣━━╈╈╈╈━━╮\n┃┈┈▏.    .╰╯╯╯╭╮┫\n┃┈--.╭━━━━━━╈╈╯\n╰━━╯-.           . ╰╯',
    `              .               .   ╭\n╭━━╮╭╭╭╮.           ╭ ╯\n┃▔╲┣╈╈╈╈━━━╮╭╯╭\n┃┈┈▏.╰╯╯╯╭╮━┫  \n┃┈--.╭━━━━╈╈━╯╰╮╰\n╰━━╯-.        ╰╯...-    ╰ ╮\n   .         . .  .  .. . . .  . .. .  ╰\n\n*🔥 @${who.split('@')[0]} SE LA JALÓ PENSANDO EN ${name}.*`
  ];

  const { key } = await sock.sendMessage(from, {
    text: frames[0],
    mentions: [who, ...(mentioned ? [mentioned] : [])]
  });

  for (let i = 1; i < frames.length; i++) {
    await new Promise(res => setTimeout(res, 1000)); // 1 segundo entre frames
    await sock.sendMessage(from, {
      text: frames[i],
      edit: key,
      mentions: [who, ...(mentioned ? [mentioned] : [])]
    });
  }
}
