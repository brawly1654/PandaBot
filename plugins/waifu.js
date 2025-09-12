import fetch from 'node-fetch';

export const command = 'waifu';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const name = msg.pushName || sender.split('@')[0];

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender;

  await sock.sendMessage(from, {
    text: `✨ Generando waifu para @${mentionedJid.split('@')[0]}...`,
    mentions: [mentionedJid]
  }, { quoted: msg });

  try {
    const res = await fetch('https://api.waifu.pics/sfw/waifu');
    const data = await res.json();

    if (!data?.url) throw new Error('Sin imagen');

    await sock.sendMessage(from, {
      image: { url: data.url },
      caption: `🖼️ *Imagen:* Waifu\n👤 *Solicitado por:* @${mentionedJid.split('@')[0]}`,
      mentions: [mentionedJid]
    }, { quoted: msg });

  } catch (err) {
    console.error('Error en .waifu:', err);
    await sock.sendMessage(from, { text: '❌ No se pudo generar una waifu. Intenta de nuevo más tarde.' }, { quoted: msg });
  }
}
