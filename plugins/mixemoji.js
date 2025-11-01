import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import webp from 'node-webpmux';
import { promisify } from 'util';

const execPromise = promisify(ffmpeg);

//función importante□
const tempFolder = path.join(tmpdir(), "temp-mixemoji");
if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder, { recursive: true });

function randomFileName(ext) {
  return `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`;
}

async function imageToWebp(media) {
  const tmpIn = path.join(tempFolder, randomFileName("jpg"));
  const tmpOut = path.join(tempFolder, randomFileName("webp"));
  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ffmpeg(tmpIn)
      .on("error", reject)
      .on("end", resolve)
      .addOutputOptions([
        "-vcodec", "libwebp",
        "-vf", "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
      ])
      .toFormat("webp")
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return buff;
}

async function addExif(webpBuffer, metadata) {
  const tmpIn = path.join(tempFolder, randomFileName("webp"));
  const tmpOut = path.join(tempFolder, randomFileName("webp"));
  fs.writeFileSync(tmpIn, webpBuffer);

  const json = {
    "sticker-pack-id": "azura-ultra-mixemoji",
    "sticker-pack-name": metadata.packname,
    "sticker-pack-publisher": metadata.author,
    "emojis": metadata.categories || [""],
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57,
    0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00,
    0x00, 0x00,
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

async function writeExifImg(media, metadata) {
  const wMedia = await imageToWebp(media);
  return await addExif(wMedia, metadata);
}

export const command = 'mixemoji';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderName = msg.pushName || "Usuario Desconocido";
  const text = args.join(" ");

  if (!text.includes("+")) {
    await sock.sendMessage(from, {
      text: "❌ *Formato incorrecto.* Usa: .mixemoji 😳+😩"
    }, { quoted: msg });
    return;
  }

  const [emo1, emo2] = text.split("+").map(e => e.trim());
  if (!emo1 || !emo2) {
    await sock.sendMessage(from, {
      text: "⚠️ *Debes dar dos emojis para combinar.*\nEjemplo: .mixemoji 😳+😩"
    }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, { react: { text: "🔄", key: msg.key } });

    const url = `https://api.neoxr.eu/api/emoji?q=${encodeURIComponent(emo1 + "_" + emo2)}&apikey=russellxz`;
    const res = await fetch(url);
    const json = await res.json();

    if (!json.status || !json.data?.url) {
      await sock.sendMessage(from, {
        text: "❌ *No se pudo combinar esos emojis.*",
      }, { quoted: msg });
      return;
    }

    const response = await fetch(json.data.url);
    const imageBuffer = await response.buffer();

    const now = new Date();
    const fechaCreacion = `📅 ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()} 🕒 ${now.getHours()}:${now.getMinutes()}`;

    const metadata = {
      packname: `✨ Emoji Mix by ${senderName} ✨`,
      author: `🤖 PandaBot\n🛠️ Panda.Crew 💻\n${fechaCreacion}`,
      categories: [emo1, emo2],
    };

    const stickerPath = await writeExifImg(imageBuffer, metadata);

    await sock.sendMessage(from, {
      sticker: { url: stickerPath },
    }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

  } catch (err) {
    console.error("❌ Error en mixemoji:", err);
    await sock.sendMessage(from, {
      text: "❌ *Ocurrió un error al procesar los emojis.*",
    }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: "❌", key: msg.key } });
  }
}

