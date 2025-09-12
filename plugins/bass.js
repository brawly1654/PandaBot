import fs from 'fs';
import { exec } from 'child_process';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export const command = 'bass';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;

  // Obtenemos el mensaje citado real
  const quoted = msg.quoted || (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
    ? { message: msg.message.extendedTextMessage.contextInfo.quotedMessage }
    : null);

  if (!quoted) {
    await sock.sendMessage(from, { text: `🎵 Responde a un audio o nota de voz con .${command}` }, { quoted: msg });
    return;
  }

  // Detectar el objeto multimedia (audio, ptt, etc)
  const quotedMsg = quoted.message || {};
  let mediaMessage = quotedMsg.audioMessage || quotedMsg.ptt || quotedMsg.voiceMessage;

  // Revisar si es mensaje efímero o view once
  if (!mediaMessage && quotedMsg.ephemeralMessage) {
    mediaMessage = quotedMsg.ephemeralMessage.message.audioMessage || quotedMsg.ephemeralMessage.message.ptt || quotedMsg.ephemeralMessage.message.voiceMessage;
  }
  if (!mediaMessage && quotedMsg.viewOnceMessageV2) {
    mediaMessage = quotedMsg.viewOnceMessageV2.message.audioMessage || quotedMsg.viewOnceMessageV2.message.ptt || quotedMsg.viewOnceMessageV2.message.voiceMessage;
  }
  
  // Si no se encuentra un audio, enviar mensaje de error
  if (!mediaMessage) {
    await sock.sendMessage(from, { text: `🎵 Responde a un audio o nota de voz con .${command}` }, { quoted: msg });
    return;
  }

  try {
    const stream = await downloadContentFromMessage(mediaMessage, 'audio');

    const mediaPath = getRandom('.mp3');
    const writeStream = fs.createWriteStream(mediaPath);

    for await (const chunk of stream) {
      writeStream.write(chunk);
    }
    writeStream.end();

    writeStream.on('finish', () => {
      const ran = getRandom('.mp3');

      // Comando ffmpeg para realzar los bajos
      exec(`ffmpeg -i "${mediaPath}" -af equalizer=f=94:width_type=o:width=2:g=30 "${ran}"`, (err) => {
        fs.unlinkSync(mediaPath); // Eliminar el archivo de entrada temporal
        if (err) {
          console.error('❌ Error al procesar el audio:', err);
          sock.sendMessage(from, { text: '❌ Error procesando el audio.' }, { quoted: msg });
          return;
        }
        
        const buff = fs.readFileSync(ran);
        sock.sendMessage(from, { audio: buff, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
        fs.unlinkSync(ran); // Eliminar el archivo de salida temporal
      });
    });

  } catch (e) {
    console.error('❌ Error general:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar el audio.' }, { quoted: msg });
  }
}

function getRandom(ext) {
  return `${Math.floor(Math.random() * 10000)}${ext}`;
}

