import { getApiKey } from '../PandaLove/stellarwa.js';
import fetch from 'node-fetch';
import { isVip } from '../utils/vip.js';

export const command = 'lyrics';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }

    const songQuery = args.join(' ');
    if (!songQuery) {
        return sock.sendMessage(from, { text: '❌ Por favor, especifica el nombre de la canción. Ejemplo: `.lyrics Despacito Luis Fonsi`' });
    }

    const encodedQuery = encodeURIComponent(songQuery);
    const apiKey = await getApiKey();
    const apiUrl = `https://api.stellarwa.xyz/tools/lyrics?query=${encodedQuery}&apikey=${apiKey}`;

    console.log('Llamando a URL:', apiUrl);

    await sock.sendMessage(from, { text: `🔍 Buscando letras para "*${songQuery}*"...` });

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                // en caso de que se requiera autenticación por header:
                // 'Authorization': `Bearer ${apiKey}`
            },
        });

        console.log('Status HTTP recibido:', response.status);

        const text = await response.text();
        console.log('Raw response body:', text);

        if (!response.ok) {
            // si te regresan 404, 401, etc., puedes mostrar lo que viene en el body
            return sock.sendMessage(from, { text: `🚨 Error de la API (HTTP ${response.status}). Respuesta: ${text}` });
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('Error al parsear JSON:', e);
            return sock.sendMessage(from, { text: `❌ La respuesta no es un JSON válido. Contenido crudo: ${text}` });
        }

        // Aquí ajusta según cómo sea la estructura real de la respuesta de la API
        // Supongamos que la API devuelve algo como { status: true/false, data: { title, artist, lyrics, album }, message: '...' }
        const { status, data: result, message } = data;

        if (!status || !result || !result.lyrics) {
            const errMsg = message || 'No se encontraron letras para esa consulta.';
            return sock.sendMessage(from, { text: `⚠️ No se pudo obtener letras. ${errMsg}` });
        }

        const title = result.title || 'N/A';
        const artist = result.artist || 'N/A';
        const album = result.album?.title || result.album || 'N/A';

        let lyricsMessage = `
🎤 *LETRAS ENCONTRADAS* 🎶
------------------------------------------
*Título:* ${title}
*Artista:* ${artist}
*Álbum:* ${album}
------------------------------------------

${result.lyrics}
        `;
        lyricsMessage = lyricsMessage.replace(/\r\n/g, '\n');

        return sock.sendMessage(from, { text: lyricsMessage });

    } catch (error) {
        console.error('Error inesperado al llamar API:', error);
        return sock.sendMessage(from, { text: '🚨 Ocurrió un error interno al procesar la solicitud.' });
    }
}
