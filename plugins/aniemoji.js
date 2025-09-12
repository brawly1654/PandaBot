import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import webp from 'node-webpmux';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tempFolder = path.join(tmpdir(), "temp-aniemoji");
if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

export const command = 'aniemoji';

export async function run(sock, msg, args) {
  const emoji = args.join('').trim();
  const from = msg.key.remoteJid;

  if (!emoji || !emoji.match(/\p{Emoji}/u)) {
    await sock.sendMessage(from, {
      text: `❗ *Envía un emoji para animarlo como sticker.*\n\n📌 *Ejemplo:* .aniemoji 😎`
    }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, {
      react: { text: "🕒", key: msg.key }
    });

    const { data } = await axios.get(`https://api.neoxr.eu/api/emojito?q=${encodeURIComponent(emoji)}&apikey=russellxz`);

    if (!data.status || !data.data?.url) {
      await sock.sendMessage(from, {
        text: "❌ *No se pudo generar el emoji animado. Intenta con otro.*"
      }, { quoted: msg });
      return;
    }

    const mediaRes = await axios.get(data.data.url, { responseType: "arraybuffer" });
    const buffer = Buffer.from(mediaRes.data);

    const senderName = msg.pushName || "Usuario";
    const now = new Date();
    const fechaCreacion = `📅 ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} 🕒 ${now.getHours()}:${now.getMinutes()}`;

    const metadata = {
      "sticker-pack-id": "pandabot-aniemoji",
      "sticker-pack-name": `✨ Emoji Animado: ${senderName}`,
      "sticker-pack-publisher": `🤖 PandaBot`,
      "emojis": [emoji]
    };
    
    const stickerBuffer = await writeExifDirect(buffer, metadata);

    await sock.sendMessage(from, {
      sticker: stickerBuffer
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "✅", key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en aniemoji:", err);
    await sock.sendMessage(from, {
      text: "❌ *Error procesando el emoji animado. Asegúrate de que el emoji sea válido.*"
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "❌", key: msg.key }
    });
  }
}


async function writeExifDirect(webpBuffer, metadata) {
  const tmpIn = path.join(tempFolder, `${Crypto.randomBytes(6).toString('hex')}.webp`);
  const tmpOut = path.join(tempFolder, `${Crypto.randomBytes(6).toString('hex')}.webp`);
  fs.writeFileSync(tmpIn, webpBuffer);

  const json = {
    "sticker-pack-id": metadata["sticker-pack-id"],
    "sticker-pack-name": metadata["sticker-pack-name"],
    "sticker-pack-publisher": metadata["sticker-pack-publisher"],
    "emojis": metadata.emojis || [""]
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00
  ]);
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
  const exif = Buffer.concat([exifAttr, jsonBuff]);
  exif.writeUIntLE(jsonBuff.length, 14, 4);

  const img = new webp.Image();
  await img.load(tmpIn);
  img.exif = exif;
  await img.save(tmpOut);
  fs.unlinkSync(tmpIn);
  return tmpOut;
}

