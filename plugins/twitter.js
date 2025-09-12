import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import FormData from 'form-data';

export const command = 'x';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const user = sender.split('@')[0];

  if (!args[0]) {
    await sock.sendMessage(from, {
      text: `*[❗️] Uso correcto del comando:*\n.twitter https://twitter.com/NetflixLAT/status/1496558658620174340`,
    }, { quoted: msg });
    return;
  }

  try {
    const res = await descargarTwitter(args[0]);
    const result = res.result.reverse().filter(({ mime }) => /video/i.test(mime));
    let video, index;

    for (const vid of result) {
      try {
        const response = await fetch(vid.link);
        video = await response.buffer();
        index = result.indexOf(vid);
        break;
      } catch (e) {
        continue;
      }
    }

    if (!video) {
      await sock.sendMessage(from, {
        text: `❌ No se pudo descargar el video. Asegúrate de que el enlace sea válido.`,
      }, { quoted: msg });
      return;
    }

    const selected = result[index];

    await sock.sendMessage(from, {
      video: video,
      mimetype: 'video/mp4',
      caption: `
✨ *Usuario:* ${res.name}
📍 *URL:* ${args[0]}
📎 *Descarga:* ${selected.link}
      `.trim()
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, {
      text: `❌ Error al procesar el enlace. Asegúrate de usar un enlace válido de Twitter.`,
    }, { quoted: msg });
  }
}

async function descargarTwitter(url) {
  if (!/http(?:s)?:\/\/(?:www\.)?twitter\.com\/([a-zA-Z0-9_]+)/i.test(url)) {
    throw new Error('Enlace no válido');
  }

  const form = new FormData();
  form.append('url', encodeURI(url));
  form.append('submit', '');

  const res = await fetch('https://www.expertsphp.com/instagram-reels-downloader.php', {
    method: 'POST',
    headers: {
      'accept': 'text/html,application/xhtml+xml',
      'origin': 'https://www.expertsphp.com',
      'referer': 'https://www.expertsphp.com/twitter-video-downloader.html',
      'user-agent': 'Mozilla/5.0',
      ...form.getHeaders()
    },
    body: form
  });

  const html = await res.text();
  const $ = cheerio.load(html);
  const result = [];

  $('#showdata > div > table > tbody > tr').each(function () {
    result.push({
      link: $(this).find('td:nth-child(1) > a').attr('href'),
      mime: $(this).find('td:nth-child(2) > strong').text()
    });
  });

  const nameMatch = [...url.matchAll(/twitter\.com\/([a-zA-Z0-9_]+)/g)];
  const name = nameMatch?.[0]?.[1] || 'Usuario desconocido';

  return { name, result };
}
