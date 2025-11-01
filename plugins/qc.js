import { isVip } from '../utils/vip.js';
import axios from 'axios';
import { writeExifImg } from '../lib/sticker.js';

const flagMap = [
  ['598', '🇺🇾'], ['595', '🇵🇾'], ['593', '🇪🇨'], ['591', '🇧🇴'],
  ['590', '🇧🇶'], ['509', '🇭🇹'], ['507', '🇵🇦'], ['506', '🇨🇷'],
  ['505', '🇳🇮'], ['504', '🇭🇳'], ['503', '🇸🇻'], ['502', '🇬🇹'],
  ['501', '🇧🇿'], ['599', '🇨🇼'], ['597', '🇸🇷'], ['596', '🇬🇫'],
  ['594', '🇬🇫'], ['592', '🇬🇾'], ['590', '🇬🇵'], ['549', '🇦🇷'],
  ['58', '🇻🇪'], ['57', '🇨🇴'], ['56', '🇨🇱'], ['55', '🇧🇷'],
  ['54', '🇦🇷'], ['53', '🇨🇺'], ['52', '🇲🇽'], ['51', '🇵🇪'],
  ['34', '🇪🇸'], ['1', '🇺🇸']
];

function numberWithFlag(num) {
  const clean = num.replace(/[^0-9]/g, '');
  for (const [code, flag] of flagMap) {
    if (clean.startsWith(code)) return `${num} ${flag}`;
  }
  return num;
}

async function niceName(jid, conn, msg, fallback = '') {
  try {
    const name = await conn.getName(jid);
    if (name) return name;
  } catch {}

  if (msg.pushName) return msg.pushName;

  return numberWithFlag(jid.split('@')[0]);
}

const colors = {
  rojo: '#FF0000', azul: '#0000FF', morado: '#800080', verde: '#008000',
  amarillo: '#FFFF00', naranja: '#FFA500', celeste: '#00FFFF',
  rosado: '#FFC0CB', negro: '#000000'
};

export const command = 'qc';

export async function run(sock, msg, args) {
  try {
    const sender = msg.key.participant || msg.key.remoteJid;

    if (!isVip(sender)) {
      await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
      return;
    }

    const chatId = msg.key.remoteJid;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    let targetJid = msg.key.participant || msg.key.remoteJid;
    let textQuoted = '';

    if (quoted && ctx?.participant) {
      targetJid = ctx.participant;
      textQuoted = quoted.conversation || quoted.extendedTextMessage?.text || '';
    }

    const contentFull = (args.join(' ').trim() || '').trim();

    if (!contentFull && !textQuoted) {
      await sock.sendMessage(chatId, {
        text: `✏️ Usa qc así:\n\n*• qc [texto]*\n*• qc [color] [texto]*\n\nColores disponibles:\nrojo, azul, morado, verde, amarillo, naranja, celeste, rosado, negro`
      }, { quoted: msg });
      return;
    }

    const firstWord = contentFull.split(' ')[0].toLowerCase();
    const bgColor = colors[firstWord] || colors['negro'];

    let content = '';

    if (colors[firstWord]) {
      const afterColor = contentFull.split(' ').slice(1).join(' ').trim();
      if (afterColor.length > 0) {
        content = afterColor;
      } else {
        content = textQuoted || ' ';
      }
    } else {
      content = contentFull || textQuoted || ' ';
    }

    const plain = content.replace(/@[\d\-]+/g, '');
    const displayName = await niceName(targetJid, sock, msg, null);

    let avatar = 'https://telegra.ph/file/24fa902ead26340f3df2c.png';
    try { avatar = await sock.profilePictureUrl(targetJid, 'image'); } catch {}

    await sock.sendMessage(chatId, { react: { text: '🎨', key: msg.key } });

    const quoteData = {
      type: 'quote', format: 'png', backgroundColor: bgColor,
      width: 600, height: 900, scale: 3,
      messages: [{
        entities: [],
        avatar: true,
        from: { id: 1, name: displayName, photo: { url: avatar } },
        text: plain,
        replyMessage: {}
      }]
    };

    const res = await axios.post(
      'https://bot.lyo.su/quote/generate',
      quoteData,
      { headers: { 'Content-Type': 'application/json' } }
    );

    const stickerBuf = Buffer.from(res.data.result.image, 'base64');
    const sticker = await writeExifImg(stickerBuf, {
      packname: 'PandaBot',
      author: '@Panda.Crew 💻'
    });

    await sock.sendMessage(chatId, { sticker: sticker }, { quoted: msg });
    await sock.sendMessage(chatId, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('❌ Error en qc:', e);
    await sock.sendMessage(msg.key.remoteJid, { text: '❌ Error: Este comando es solo para VIPs XD\n> Paga el vip ratita.' }, { quoted: msg });
  }
}

