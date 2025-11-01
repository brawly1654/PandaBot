import ytSearch from 'yt-search';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export const command = 'spotify';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const songQuery = args.join(' ');

  if (!songQuery) {
    return sock.sendMessage(from, {
      text: `
〔 *⛔ FALTA NOMBRE DE LA CANCIÓN* 〕
📀 *Usa el comando así:*
⚙️ .spotify <nombre de la canción>
🧪 *Ejemplo:* .spotify Enemy - Imagine Dragons
      `.trim()
    }, { quoted: msg });
  }

  await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });
  await sock.sendMessage(from, {
    text: `🔍 Buscando audio para "*${songQuery}*" en Spotify...`
  }, { quoted: msg });

  try {
    const searchResults = await ytSearch(songQuery);
    const video = searchResults.videos[0];

    if (!video) {
      return sock.sendMessage(from, {
        text: '⚠️ No se encontró ningún video relevante.'
      }, { quoted: msg });
    }

    const videoUrl = video.url;
    const fileName = `spotify_${Date.now()}.m4a`;
    const filePath = path.join('./temp', fileName);

    if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');

    // 👇 Aquí está el cambio: añadimos --add-header con User-Agent
    exec(
      `yt-dlp -f bestaudio --add-header "User-Agent: Mozilla/5.0" -o "${filePath}" "${videoUrl}"`,
      async (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error al ejecutar yt-dlp:', error);
          return sock.sendMessage(from, {
            text: '⚠️ Error al descargar el audio. Intenta con otra canción.'
          }, { quoted: msg });
        }

        try {
          const audioBuffer = fs.readFileSync(filePath);

          await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.m4a`,
            caption: `🎵 ${video.title} - ${video.author.name}`
          }, { quoted: msg });

          await sock.sendMessage(from, { react: { text: '🎶', key: msg.key } });

          fs.unlinkSync(filePath);
        } catch (err) {
          console.error('❌ Error al leer o enviar el archivo:', err);
          await sock.sendMessage(from, {
            text: '⚠️ El audio fue descargado pero no se pudo enviar.'
          }, { quoted: msg });
        }
      }
    );

  } catch (err) {
    console.error('❌ Error general en .spotify:', err);
    await sock.sendMessage(from, {
      text: `⚠️ Error inesperado: ${err.message}`
    }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
  }
}
