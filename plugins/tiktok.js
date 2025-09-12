import fg from 'api-dylux';

export const command = 'tiktok';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const text = args.join(' ');

  if (!args[0]) {
    await sock.sendMessage(from, { text: '🥷 Debes ingresar un enlace de TikTok.\n\n📌 *Ejemplo:* .tiktok https://vm.tiktok.com/ZMreHF2dC/' });
    return;
  }

  if (!/(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t)?\.?tiktok\.com\/([^\s&]+)/gi.test(text)) {
    await sock.sendMessage(from, { text: '❎ Enlace de TikTok inválido.' });
    return;
  }

  try {
    // Opcional: puedes enviar reacción si quieres
    // await sock.sendMessage(from, { react: { text: '⌛', key: msg.key } });

    const data = await fg.tiktok(args[0]);
    const { title, play, duration } = data.result;
    const { nickname } = data.result.author;

    const caption = `⚔️ TikTok
◦ 👤 *Autor:* ${nickname}
◦ 📌 *Título:* ${title}
◦ ⏱️ *Duración:* ${duration}
`
    await sock.sendMessage(from, {
      video: { url: play },
      caption
    });

    // await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
  } catch (e) {
    console.error('❌ Error en tiktok:', e);
    await sock.sendMessage(from, { text: `❌ *Error:* ${e.message}` });
  }
}
