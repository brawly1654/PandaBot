import fetch from 'node-fetch';
import axios from 'axios';

export const command = 'musica';  // .musica <nombre>
export const desc = 'Descarga música de SoundCloud'; // (opcional, para help)

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) {
        await sock.sendMessage(from, {
            text: '🚩 Ingresa el nombre de la canción de SoundCloud.\nEjemplo: .musica someone like you'
        }, { quoted: msg });
        return;
    }

    try {
        // Reacción para avisar que busca
        await sock.sendMessage(from, { react: { text: '🕒', key: msg.key }});

        // Buscar canción
        const searchUrl = `https://apis-starlights-team.koyeb.app/starlight/soundcloud-search?text=${encodeURIComponent(text)}`;
        const searchRes = await fetch(searchUrl);
        const searchJson = await searchRes.json();

        if (!searchJson || !searchJson.length) {
            await sock.sendMessage(from, { text: '❌ No encontré resultados.' }, { quoted: msg });
            return;
        }

        const { url, title } = searchJson[0];

        // Descargar
        const dlUrl = `https://apis-starlights-team.koyeb.app/starlight/soundcloud?url=${url}`;
const dlRes = await fetch(dlUrl);
const dlJson = await dlRes.json();

if (!dlJson || !dlJson.link) {
  await sock.sendMessage(from, {
    text: '❌ No se pudo obtener el audio. Puede que la URL sea inválida o la API falló.'
  }, { quoted: msg });
  return;
}

const { link: audioUrl, quality, image } = dlJson;

let audioBuffer;
try {
  audioBuffer = await getBuffer(audioUrl);
} catch (err) {
  console.error('❌ Error al obtener el buffer del audio:', err);
  await sock.sendMessage(from, {
    text: '❌ Error al descargar el audio. Intenta más tarde.'
  }, { quoted: msg });
  return;
}
        // Enviar imagen + info
        let infoMsg = `🎵 *- S O U N D C L O U D -*\n\n`;
        infoMsg += `✩ Título: ${title}\n`;
        infoMsg += `✩ Calidad: ${quality}\n`;
        infoMsg += `✩ Url: ${url}`;

        await sock.sendMessage(from, {
            image: { url: image },
            caption: infoMsg
        }, { quoted: msg });

        // Enviar audio
        await sock.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: msg });

        // Reacción ok
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key }});

    } catch (e) {
        console.error('❌ Error en .musica:', e);
        await sock.sendMessage(from, { react: { text: '✖️', key: msg.key }});
        await sock.sendMessage(from, { text: '❌ Ocurrió un error al intentar descargar la canción.' }, { quoted: msg });
    }
}

// Función auxiliar para obtener buffer
async function getBuffer(url) {
    try {
        const res = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'DNT': 1,
                'Upgrade-Insecure-Request': 1
            }
        });
        return res.data;
    } catch (e) {
        console.error(`Error getBuffer: ${e}`);
        throw e;
    }
}
