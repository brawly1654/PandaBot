import axios from 'axios';

export const command = 'wikipedia';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    await sock.sendMessage(from, { text: '❌ Debes escribir algo para buscar en Wikipedia. Ejemplo: *.wikipedia PandaBot*' });
    return;
  }
  
  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Buscando en Wikipedia...` });

  try {
    const response = await axios.get(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    const data = response.data;
    
    if (data.title && data.title.includes('No se encontraron resultados')) {
      await sock.sendMessage(from, { text: `❌ No se encontraron resultados para "${query}".` }, { quoted: loadingMsg });
      return;
    }

    const message = `
🌐 *Wikipedia*
--------------------
*Título:* ${data.title}
*Resumen:* ${data.extract}
*URL:* ${data.content_urls.desktop.page}
`;

    if (data.thumbnail?.source) {
      await sock.sendMessage(from, { image: { url: data.thumbnail.source }, caption: message }, { quoted: loadingMsg });
    } else {
      await sock.sendMessage(from, { text: message }, { quoted: loadingMsg });
    }

  } catch (e) {
    console.error('❌ Error en el comando wikipedia:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al buscar en Wikipedia. Inténtalo más tarde.' }, { quoted: loadingMsg });
  }
}

