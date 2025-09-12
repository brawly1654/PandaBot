import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

export const command = 'hornycard';

// URL de la plantilla de la licencia
const TEMPLATE_URL = 'http://localhost:8000/upload/8f0ca6d8e8ab537ea48580234fa0df195d3966d5r1-554-554v2_hq.jpg';
// URL de imagen de perfil de respaldo
const FALLBACK_AVATAR = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  let targetUser = sender;

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted) {
    targetUser = msg.message.extendedTextMessage.contextInfo.participant;
  }

  const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
  if (mentionedJid) {
    targetUser = mentionedJid;
  }

  try {
    const avatarUrl = await sock.profilePictureUrl(targetUser, 'image').catch(() => FALLBACK_AVATAR);

    const [template, avatar] = await Promise.all([
      loadImage(TEMPLATE_URL),
      loadImage(avatarUrl)
    ]);

    const canvas = createCanvas(template.width, template.height);
    const ctx = canvas.getContext('2d');

    // Dibuja la plantilla como fondo
    ctx.drawImage(template, 0, 0, template.width, template.height);

    // Dibuja el avatar en forma de círculo
    const avatarSize = 100;
    const avatarX = 40;
    const avatarY = 50;

    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);

    // Restablece el clip para que los futuros dibujos no se recorten
    ctx.restore();

    const buffer = canvas.toBuffer('image/png');

    await sock.sendMessage(from, {
      image: buffer,
      fileName: 'hornycard.png',
      caption: `horny:> para @${targetUser.split('@')[0]}`,
      mimetype: 'image/png'
    }, { quoted: msg, mentions: [targetUser] });

  } catch (e) {
    console.error('❌ Error al generar la hornycard:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al generar la hornycard. Inténtalo de nuevo más tarde.' }, { quoted: msg });
  }
}

