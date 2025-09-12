import fetch from 'node-fetch';

export const command = 'lyrics';

const GENIUS_ACCESS_TOKEN = 'kl8onUnQWd7JQZdl';

async function searchGenius(query) {
  const response = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` }
  });
  return await response.json();
}

async function getLyricsGenius(path) {
  const response = await fetch(`https://api.genius.com${path}`, {
    headers: { 'Authorization': `Bearer ${GENIUS_ACCESS_TOKEN}` }
  });
  return await response.json();
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const query = args.join(' ');

  if (!query) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el nombre de la canción. Ejemplo: *.lyrics Bohemian Rhapsody*' }, { quoted: msg });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Buscando la letra de *${query}*...` }, { quoted: msg });

  try {
    const searchResponse = await searchGenius(query);
    
    // --- LÓGICA CORREGIDA ---
    if (!searchResponse.response.hits || searchResponse.response.hits.length === 0) {
      await sock.sendMessage(from, { text: `❌ No se encontraron resultados para *${query}*.` }, { quoted: loadingMsg });
      return;
    }
    // --- FIN DE LA LÓGICA CORREGIDA ---

    const hit = searchResponse.response.hits[0];

    const lyricsResponse = await getLyricsGenius(hit.result.path);
    const lyricsUrl = lyricsResponse.response.song.url;

    const lyricsPage = await fetch(lyricsUrl);
    const lyricsHtml = await lyricsPage.text();
    const lyricsText = lyricsHtml.match(/<div class="lyrics">([\s\S]+?)<\/div>/i);

    if (!lyricsText) {
      throw new Error("No se pudo extraer la letra.");
    }
    
    const cleanedLyrics = lyricsText[1].replace(/<[^>]*>/g, '').trim();

    const message = `
🎶 *Letra de ${hit.result.title} - ${hit.result.artist_names}* 🎶
--------------------------------
${cleanedLyrics}
`;

    await sock.sendMessage(from, { text: message }, { quoted: loadingMsg });

  } catch (e) {
    console.error('❌ Error al buscar la letra de la canción:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo más tarde.' }, { quoted: msg });
  }
}

