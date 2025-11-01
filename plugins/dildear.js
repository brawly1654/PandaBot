export const command = 'dildear';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) {
    return sock.sendMessage(from, { text: 'Este comando solo funciona en grupos.' });
  }

  const target = mentioned;
  if (!target) {
    return sock.sendMessage(from, {
      text: 'Debes mencionar a alguien para meterle un dildo 😏.\n\nEjemplo: *.dildear @usuario*'
    });
  }

  if (target === sender) {
    return sock.sendMessage(from, {
      text: 'No te dildees a ti mismo bro 😏'
    });
  }
  const nombre1 = msg.pushName || 'Tú';
  const nombre2 = '@' + target.split('@')[0];

  const barra = [
    '[░░░░░░░░░░] 0%',
    '[█░░░░░░░░░] 10%',
    '[██░░░░░░░░] 20%',
    '[███░░░░░░░] 30%',
    '[████░░░░░░] 40%',
    '[█████░░░░░] 50%',
    '[██████░░░░] 60%',
    '[███████░░░] 70%',
    '[████████░░] 80%',
    '[█████████░] 90%',
    '[██████████] 100%\n\n Se vino...🥵🥵'
  ];

  let texto = `🔥 *${nombre1}* está dildeando a *${nombre2}* 🔥\n\n`;

  const { key } = await sock.sendMessage(from, {
    text: texto + barra[0],
    mentions: [sender, target]
  });

  for (let i = 1; i < barra.length; i++) {
    await new Promise(res => setTimeout(res, 500));
    await sock.sendMessage(from, {
      text: texto + barra[i],
      edit: key,
      mentions: [sender, target]
    });
  }
}
