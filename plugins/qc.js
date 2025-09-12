import axios from 'axios';
import { sticker } from '../lib/sticker.js'; // Asegúrate de que este archivo exista

export const command = 'qc';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    let text;
    let targetUser = sender;

    if (quoted && quoted.text) {
        text = quoted.text;
        targetUser = quoted.participant || quoted.sender; // Obtiene el JID del autor del mensaje citado
    } else if (args.length >= 1) {
        text = args.join(' ');
        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (mentionedJid) {
            targetUser = mentionedJid;
        }
    } else {
        await sock.sendMessage(from, { text: '❌ Cita un mensaje o escribe un texto para convertirlo en sticker.' }, { quoted: msg });
        return;
    }

    if (!text) {
        await sock.sendMessage(from, { text: '❌ Te faltó el texto para el sticker.' }, { quoted: msg });
        return;
    }

    // Límite de caracteres para evitar spam o errores de la API
    if (text.length > 100) {
        await sock.sendMessage(from, { text: '❌ El texto no puede tener más de 100 caracteres.' }, { quoted: msg });
        return;
    }
    
    try {
        const pp = await sock.profilePictureUrl(targetUser, 'image').catch(() => 'https://telegra.ph/file/24fa902ead26340f3df2c.png');
        const nombre = msg.pushName || targetUser.split('@')[0];

        const obj = {
            type: "quote",
            format: "png",
            backgroundColor: "#000000",
            width: 512,
            height: 768,
            scale: 2,
            messages: [{
                entities: [],
                avatar: true,
                from: { id: 1, name: nombre, photo: { url: pp } },
                text: text,
                replyMessage: {}
            }]
        };

        const res = await axios.post('https://bot.lyo.su/quote/generate', obj, {
            headers: { 'Content-Type': 'application/json' }
        });

        const buffer = Buffer.from(res.data.result.image, 'base64');
        const stiker = await sticker(buffer, false, 'PandaBot', 'Stickers');

        if (stiker) {
            await sock.sendMessage(from, { sticker: stiker }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: '❌ No se pudo generar el sticker.' }, { quoted: msg });
        }
    } catch (e) {
        console.error('❌ Error en el comando qc:', e);
        await sock.sendMessage(from, { text: `❌ Ocurrió un error al generar el sticker. El servicio puede estar caído.` }, { quoted: msg });
    }
}

