import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

export const command = 'catbox';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const emoji = '⚠️';
  const rwait = '⏳';
  const done = '✅';
  const error = '❌';
  const dev = 'by Lukas and Miguelito🐼';

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const quotedKey = msg.message?.extendedTextMessage?.contextInfo?.stanzaId;
  
  if (!quoted) {
    return sock.sendMessage(from, { text: `${emoji} Debes citar un archivo (imagen, video, documento, etc.) para subirlo.` }, { quoted: msg });
  }

  const mime = quoted.imageMessage?.mimetype || 
               quoted.videoMessage?.mimetype ||
               quoted.documentMessage?.mimetype ||
               '';

  if (!mime) {
    return sock.sendMessage(from, { text: `${emoji} El mensaje citado no contiene un archivo válido.` }, { quoted: msg });
  }

  await sock.sendMessage(from, { react: { text: rwait, key: msg.key } });

  try {
    const downloadMediaMessage = await import('@whiskeysockets/baileys').then(m => m.downloadMediaMessage);

    const media = await downloadMediaMessage(
      { key: quotedKey, message: quoted }, 
      'buffer', 
      {}, 
      { logger: console, reuploadRequest: sock.updateMediaMessage }
    );
    
    if (!media || !Buffer.isBuffer(media)) {
      await sock.sendMessage(from, { react: { text: error, key: msg.key } });
      return sock.sendMessage(from, { text: `${emoji} No se pudo descargar el archivo.` }, { quoted: msg });
    }

    const link = await catbox(media);

    const txt = `*乂 C A T B O X - U P L O A D E R 乂*\n\n` +
                `*» Enlace* : ${link}\n` +
                `*» Tamaño* : ${formatBytes(media.length)}\n` +
                `*» Expiración* : No expira\n\n` +
                `> *${dev}*`;

    await sock.sendMessage(from, { text: txt }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: done, key: msg.key } });
  } catch (err) {
    console.error('Error en .catbox:', err);
    await sock.sendMessage(from, { react: { text: error, key: msg.key } });
    sock.sendMessage(from, { text: `${emoji} Error al subir el archivo:\n${err.message}` }, { quoted: msg });
  }
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catbox(content) {
  const fileType = await fileTypeFromBuffer(content) || {};
  const ext = fileType.ext || 'bin';
  const mime = fileType.mime || 'application/octet-stream';

  const blob = new Blob([content], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");

  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  if (!response.ok) throw new Error(`Error en Catbox: ${response.statusText}`);
  const result = await response.text();
  
  if (result.startsWith('http')) {
      return result;
  }
  throw new Error(`Catbox falló: ${result}`);
}

