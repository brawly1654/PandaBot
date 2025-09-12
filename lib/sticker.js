import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import { exec } from 'child_process';
import { tmpdir } from 'os';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { promisify } from 'util';
import webp from 'node-webpmux';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const execPromise = promisify(exec);

/**
 * Convierte un buffer de imagen/video a un sticker.
 * @param {Buffer} buffer - Buffer de la imagen o video.
 * @param {boolean} isVideo - Si el buffer es de un video.
 * @param {string} packname - Nombre del paquete del sticker.
 * @param {string} author - Autor del sticker.
 * @returns {Promise<Buffer>}
 */
export async function sticker(buffer, isVideo, packname = 'PandaBot', author = 'Stickers') {
  const stickerPath = path.join(tmpdir(), `${Date.now()}.webp`);
  const inputPath = path.join(tmpdir(), `${Date.now()}.${isVideo ? 'mp4' : 'png'}`);
  
  writeFileSync(inputPath, buffer);

  const ffmpegCommand = isVideo
    ? `ffmpeg -i "${inputPath}" -vf "fps=10,scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0,setsar=1,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -y "${stickerPath}"`
    : `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0,setsar=1" -y "${stickerPath}"`;

  try {
    await execPromise(ffmpegCommand);
    const stickerBuffer = readFileSync(stickerPath);
    
    const img = new webp.Image();
    await img.load(stickerBuffer);
    
    img.exif = `
        {
            "sticker-pack-id": "pandabot-id",
            "sticker-pack-name": "${packname}",
            "sticker-pack-publisher": "${author}",
            "emojis": ["🎉"]
        }
    `;
    
    const finalBuffer = await img.save();
    
    unlinkSync(inputPath);
    unlinkSync(stickerPath);
    
    return finalBuffer;

  } catch (error) {
    console.error('Error al generar el sticker:', error);
    unlinkSync(inputPath);
    existsSync(stickerPath) && unlinkSync(stickerPath);
    return null;
  }
}

