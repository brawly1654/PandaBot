import fs from 'fs';
import { exec } from 'child_process';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export const command = 'robot';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const quoted = msg.quoted || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ? { message: msg.message.extendedTextMessage.contextInfo.quotedMessage }
    : null);

  if (!quoted) {
    await sock.sendMessage(from, { text: `🎵 Responde a un audio o nota de voz con .${command}` }, { quoted: msg });
    return;
  }

  const quotedMsg = quoted.message || {};
  let mediaMessage = quotedMsg.audioMessage || quotedMsg.ptt || quotedMsg.voiceMessage;

  if (!mediaMessage && quotedMsg.ephemeralMessage) {
    mediaMessage = quotedMsg.ephemeralMessage.message.audioMessage || quotedMsg.ephemeralMessage.message.ptt || quotedMsg.ephemeralMessage.message.voiceMessage;
  }
  if (!mediaMessage && quotedMsg.viewOnceMessageV2) {
    mediaMessage = quotedMsg.viewOnceMessageV2.message.audioMessage || quotedMsg.viewOnceMessageV2.message.ptt || quotedMsg.viewOnceMessageV2.message.voiceMessage;
  }

  if (!mediaMessage) {
    await sock.sendMessage(from, { text: `🎵 Responde a un audio o nota de voz con .${command}` }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadContentFromMessage(mediaMessage, 'audio');
    const inputPath = getRandom('.mp3');
    const outputPath = getRandom('.ogg');

    const writeStream = fs.createWriteStream(inputPath);
    for await (const chunk of stream) {
      writeStream.write(chunk);
    }
    writeStream.end();

    writeStream.on('finish', () => {
      const ffmpegCmd = `ffmpeg -i "${inputPath}" -filter_complex "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75" -c:a libopus -b:a 64k "${outputPath}"`;

      exec(ffmpegCmd, (err) => {
        fs.unlinkSync(inputPath);
        if (err) {
          console.error('❌ Error al procesar el audio:', err);
          sock.sendMessage(from, { text: '❌ Error procesando el audio.' }, { quoted: msg });
          return;
        }

        const buff = fs.readFileSync(outputPath);
        sock.sendMessage(from, {
          audio: buff,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        }, { quoted: msg });

        fs.unlinkSync(outputPath);
      });
    });

  } catch (e) {
    console.error('❌ Error general:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el audio.' }, { quoted: msg });
  }
}

function getRandom(ext) {
  return `${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
}
