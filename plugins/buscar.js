import google from 'google-it';

export const command = 'buscar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: `Por favor, escribe lo que quieres buscar. Ejemplo: *!buscar precio del bitcoin*` });
    return;
  }

  const query = args.join(' ');
  const loadingMsg = await sock.sendMessage(from, { text: `🔎 Buscando en la web para: *${query}*...` });

  try {
    const results = await google({ query: query });
    
    let responseText = `*Resultados de la búsqueda para: ${query}*\n\n`;

    if (results.length > 0) {
      for (const result of results.slice(0, 3)) { // Muestra los primeros 3 resultados
        responseText += `*Título:* ${result.title}\n`;
        responseText += `*Enlace:* ${result.link}\n`;
        responseText += `*Descripción:* ${result.snippet}\n\n`;
      }
    } else {
      responseText = `No se encontraron resultados para: *${query}*`;
    }
    
    // --- LÍNEA CORREGIDA ---
    // Combina las opciones de texto y 'quoted' en un solo objeto.
    await sock.sendMessage(from, { text: responseText, quoted: loadingMsg });
    // --- FIN DE LA CORRECCIÓN ---

  } catch (error) {
    console.error('❌ Error al ejecutar el comando buscar:', error);
    await sock.sendMessage(from, { text: 'Hubo un error al realizar la búsqueda. Por favor, inténtalo de nuevo.' });
  }
}

