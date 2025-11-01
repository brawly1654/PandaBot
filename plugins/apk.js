import { getApiKey } from '../PandaLove/stellarwa.js';
import fetch from 'node-fetch';
import { isVip } from '../utils/vip.js';

export const command = 'apk';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }

    const query = args.join(' ');
    if (!query) {
        return sock.sendMessage(from, { text: '❌ Por favor, especifica el nombre de la aplicación. Ejemplo: `.apk geometry dash`' });
    }
    
    const apiKey = await getApiKey();
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://api.stellarwa.xyz/search/apk?query=${encodedQuery}&apikey=${apiKey}`;
    console.log('Llamando a URL de APK search:', apiUrl);

    // Aviso de que está procesando
    await sock.sendMessage(from, { text: `🔍 Buscando APK para "${query}"...` });

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        const raw = await response.text();
        console.log('HTTP status:', response.status);
        console.log('Respuesta cruda APK:', raw);

        if (!response.ok) {
            return sock.sendMessage(from, { text: `🚨 Error de API (HTTP ${response.status}). Respuesta: ${raw}` });
        }

        let dataJson;
        try {
            dataJson = JSON.parse(raw);
        } catch (e) {
            console.error('Error parseando JSON de APK:', e);
            return sock.sendMessage(from, { text: `❌ Respuesta no es JSON válido. Contenido: ${raw}` });
        }

        if (!dataJson.status || !dataJson.data) {
            const msgErr = dataJson.message || 'No se encontró data en la respuesta.';
            return sock.sendMessage(from, { text: `⚠️ No se encontró APK. ${msgErr}` });
        }

        const d = dataJson.data;
        const name = d.name || 'N/A';
        const pkg = d.package || 'N/A';
        const size = d.size || 'N/A';
        const dlUrl = d.dl;

        // Primero envías los datos
        const infoMsg = `📦 *APK encontrada:*\n\n*Nombre:* ${name}\n*Package:* ${pkg}\n*Tamaño:* ${size}`;
        await sock.sendMessage(from, { text: infoMsg });

        // Ahora enviar el archivo desde la URL dlUrl
        if (dlUrl) {
            // Aquí mostramos cómo enviarlo como documento (APK) con Baileys
            // Ajusta mimetype si lo sabes (por ejemplo "application/vnd.android.package-archive")
            await sock.sendMessage(from, {
                document: {
                    url: dlUrl
                },
                fileName: `${name}.apk`,
                mimetype: 'application/vnd.android.package-archive'
            });
        } else {
            await sock.sendMessage(from, { text: '⚠️ No se encontró URL de descarga (`dl`).' });
        }

    } catch (err) {
        console.error('Error en comando apk:', err);
        await sock.sendMessage(from, { text: `⚠️ Error: ${err.message}` });
    }
}
