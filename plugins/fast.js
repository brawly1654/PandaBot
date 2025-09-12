import fs from 'fs';
import { exec } from 'child_process';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export const command = 'fast';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;

  // Obtenemos el mensaje citado real (se adapta a varios tipos)
  const quoted = msg.quoted || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ? { message: msg.message.extendedTextMessage.contextInfo.quotedMessage }
    : null);

  if (!quoted) {
    await sock.sendMessage(from, { text: `🎵 Responde a un audio o nota de voz con .${command}` }, { quoted: msg });
    return;
  }

  // Detectar el objeto multimedia (audio, ptt, etc)
  const quotedMsg = quoted.message || {};

  // Extraemos el objeto multimedia exacto para la descarga
  let mediaMessage = quotedMsg.audioMessage || quotedMsg.ptt || quotedMsg.voiceMessage;

  // También revisar si es mensaje efímero o view once y extraer la multimedia de ahí
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
    // Descargamos sólo el objeto multimedia para que tenga mediaKey
    const stream = await downloadContentFromMessage(mediaMessage, 'audio');

    const mediaPath = getRandom('.mp3');
    const writeStream = fs.createWriteStream(mediaPath);

    for await (const chunk of stream) {
      writeStream.write(chunk);
    }
    writeStream.end();

    writeStream.on('finish', () => {
      const ran = getRandom('.mp3');

      exec(`ffmpeg -i "${mediaPath}" -filter:a "atempo=1.63,asetrate=44100" "${ran}"`, (err) => {
        fs.unlinkSync(mediaPath);
        if (err) {
          console.error(err);
          sock.sendMessage(from, { text: '❌ Error procesando el audio.' }, { quoted: msg });
          return;
        }
        const buff = fs.readFileSync(ran);
        sock.sendMessage(from, { audio: buff, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
        fs.unlinkSync(ran);
      });
    });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el audio.' }, { quoted: msg });
  }
}

function getRandom(ext) {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
}
