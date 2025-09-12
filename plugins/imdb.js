import axios from 'axios';

export const command = 'imdb';

const TMDB_API_KEY = '50fb0b39ed28f456557ec351eb4f6fee';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const query = args.join(' ');
  
  if (!query) {
    await sock.sendMessage(from, { text: '❌ Debes escribir el nombre de una película o serie. Ejemplo: *.imdb The Matrix*' });
    return;
  }
  
  const loadingMsg = await sock.sendMessage(from, { text: `⏳ Buscando en TMDb...` });

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES`;
    const searchResponse = await axios.get(searchUrl);
    const results = searchResponse.data.results;
    
    if (results.length === 0) {
      await sock.sendMessage(from, { text: `❌ No se encontraron resultados para "${query}".` }, { quoted: loadingMsg });
      return;
    }

    const movieId = results[0].id;
    const movieUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=es-ES`;
    const movieResponse = await axios.get(movieUrl);
    const data = movieResponse.data;

    const director = data.credits.crew.find(person => person.job === 'Director')?.name || 'Desconocido';
    const actors = data.credits.cast.slice(0, 3).map(actor => actor.name).join(', ') || 'Desconocido';
    
    const posterUrl = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : 'https://i.imgur.com/gK6kQG9.png';
    
    const message = `
🎬 *Información de la película/serie*

*Título:* ${data.title} (${data.release_date.substring(0, 4)})
*Calificación:* ${data.vote_average.toFixed(1)} / 10
*Director:* ${director}
*Actores:* ${actors}
*Género:* ${data.genres.map(g => g.name).join(', ')}
*Sinopsis:* ${data.overview}
`;

    await sock.sendMessage(from, { image: { url: posterUrl }, caption: message }, { quoted: loadingMsg });

  } catch (e) {
    console.error('❌ Error en el comando imdb:', e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al buscar en TMDb. Revisa tu clave de API.' }, { quoted: loadingMsg });
  }
}

