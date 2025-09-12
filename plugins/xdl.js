// ./plugins/xdl.js
import TwitterScraper from '@tcortega/twitter-scraper';
import fs from 'fs';
import path from 'path';

export const command = 'xdl';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

    if (!args[0]) {
        await sock.sendMessage(from, { text: '❌ Debes enviar un enlace de X/Twitter.' });
        return;
    }

    const url = args[0];

    try {
        // Descarga usando la función correcta
        const media = await TwitterScraper.downloadMedia(url);

        if (!media || media.length === 0) {
            await sock.sendMessage(from, { text: '❌ No se encontró contenido descargable.' });
            return;
        }

        // Envía los archivos descargados (solo el primero como ejemplo)
        const fileUrl = media[0].url;
        const extension = path.extname(fileUrl).split('?')[0] || '.mp4';
        const fileName = `xdl${extension}`;

        await sock.sendMessage(from, {
            document: { url: fileUrl },
            fileName: fileName,
            mimetype: 'video/mp4'
        });

    } catch (e) {
        console.error('Error en .xdl:', e);
        await sock.sendMessage(from, { text: '❌ No se pudo descargar el contenido.' });
    }
}
