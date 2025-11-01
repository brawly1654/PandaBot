import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import webp from 'node-webpmux';
import { exec } from 'child_process';
import Crypto from 'crypto';

const execPromise = promisify(exec);

async function imageToWebp(media) {
  const tmpFileIn = path.join(tmpdir(), `${Crypto.randomBytes(6).toString('hex')}.jpg`);
  const tmpFileOut = path.join(tmpdir(), `${Crypto.randomBytes(6).toString('hex')}.webp`);

  fs.writeFileSync(tmpFileIn, media);

  const ffmpegCommand = `ffmpeg -i "${tmpFileIn}" -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,pad=320:320:-1:-1:color=white@0.0,setsar=1" -y "${tmpFileOut}"`;

  try {
    await execPromise(ffmpegCommand);
    const buff = fs.readFileSync(tmpFileOut);
    fs.unlinkSync(tmpFileIn);
    fs.unlinkSync(tmpFileOut);
    return buff;
  } catch (err) {
    fs.unlinkSync(tmpFileIn);
    return null;
  }
}

export async function writeExifImg(buffer, metadata) {
  const webpBuffer = await imageToWebp(buffer);
  if (!webpBuffer) {
    throw new Error("No se pudo convertir la imagen a WebP.");
  }
  
  const img = new webp.Image();
  await img.load(webpBuffer);
  
  const json = {
    "sticker-pack-id": "pandabot-id",
    "sticker-pack-name": metadata.packname || 'PandaBot',
    "sticker-pack-publisher": metadata.author || 'Stickers',
    "emojis": metadata.categories || [""]
  };
  
  const exif = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]); 
  const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8"); 
  const newExif = Buffer.concat([exif, jsonBuff]); 
  newExif.writeUIntLE(jsonBuff.length, 14, 4); 

  img.exif = newExif; 
  const finalBuffer = await img.save(null);
  
  return finalBuffer;
}

