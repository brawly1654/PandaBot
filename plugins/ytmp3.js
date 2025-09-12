import ytdl from "ytdl-core";
import ytsr from "ytsr";
import fs from "fs";
import path from "path";
import { exec } from "child_process";

export const command = 'ytmp3';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const text = args.join(" ");

  try {
    await sock.sendMessage(from, { react: { text: "🔎", key: msg.key } });

    if (!text) {
      await sock.sendMessage(from, { text: "> Escribe el nombre del video que deseas descargar." }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
      return;
    }

    const search = await ytsr(text, { limit: 1 });
    const video = search.items.find(item => item.type === "video");

    if (!video) {
      await sock.sendMessage(from, { text: "> No se encontró ningún resultado para tu búsqueda." }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
      return;
    }

    if (video.duration && (video.duration.includes("hour") || parseDuration(video.duration) > 300)) {
      await sock.sendMessage(from, { text: "> El video no puede durar más de 5 minutos." }, { quoted: msg });
      await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
      return;
    }

    const url = video.url;
    const info = await ytdl.getInfo(url);
    const title = video.title.replace(/[^\w\s]/gi, "").slice(0, 40).trim();
    const filePath = path.join('./temp', `${Date.now()}.mp3`);

    const audio = ytdl(url, { filter: 'audioonly' });

    const ffmpegCmd = `ffmpeg -i pipe:0 -vn -ab 128k -ar 44100 -y "${filePath}"`;
    const ffmpeg = exec(ffmpegCmd);

    audio.pipe(ffmpeg.stdin);

    ffmpeg.on('close', async () => {
      const buffer = fs.readFileSync(filePath);
      await sock.sendMessage(from, {
        document: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: msg });

      await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });
      fs.unlinkSync(filePath);
    });

  } catch (e) {
    console.error("Error en ytmp3:", e);
    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
    await sock.sendMessage(from, { text: "> Ocurrió un error al procesar el audio." }, { quoted: msg });
  }
}

function parseDuration(durationStr) {
  const parts = durationStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else {
    return parts[0];
  }
}
