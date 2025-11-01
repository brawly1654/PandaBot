import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { exec } from 'child_process';
import axios from 'axios';

export const command = 'adminabuse';

const pedoUrls = [
  'http://localhost:8000/upload/VID-20250906-WA0119.mp4',
  'http://localhost:8000/upload/VID-20250906-WA0122.mp4',
  'http://localhost:8000/upload/VID-20250906-WA0123.mp4',
  'http://localhost:8000/upload/keyciita_2025-09-21-00-36-54_1758425814015.mp4',
  'http://localhost:8000/upload/VID-20251005-WA0246.mp4'
];

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  
  if (pedoUrls.length === 0) {
    await sock.sendMessage(from, { text: '❌ No hay videos de pedos en la lista.' });
    return;
  }
  
  const randomUrl = pedoUrls[Math.floor(Math.random() * pedoUrls.length)];
  const loadingMsg = await sock.sendMessage(from, { text: '⏳ Procesando el audio...' });

  try {
    const videoRes = await axios.get(randomUrl, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(videoRes.data);

    const inputPath = path.join(tmpdir(), `input-${Date.now()}.mp4`);
    const outputPath = path.join(tmpdir(), `audio-${Date.now()}.mp3`);
    fs.writeFileSync(inputPath, videoBuffer);
    
    exec(`ffmpeg -i "${inputPath}" -vn -acodec libmp3lame "${outputPath}"`, async (err) => {
      fs.unlinkSync(inputPath);
      
      if (err) {
        console.error(err);
        await sock.sendMessage(from, { text: '❌ Error al extraer el audio del video.' }, { quoted: loadingMsg });
        return;
      }

      const audioBuffer = fs.readFileSync(outputPath);
      await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mp4' }, { quoted: msg });
      
      fs.unlinkSync(outputPath);
    });
    
  } catch (e) {
    console.error('❌ Error en el comando pedo:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el video.' }, { quoted: loadingMsg });
  }
}

