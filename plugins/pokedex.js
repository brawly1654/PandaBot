import fetch from 'node-fetch';

export const command = 'pokedex';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const text = args.join(' ');
  const rwait = '⏳'; // Emoji de espera
  const done = '✅';  // Emoji de éxito
  const error = '❌'; // Emoji de error
  const dev = 'PandaBot'; // Nombre del bot o autor
  const packname = 'Pokédex';
  const channel = 'https://www.pokemon.com/es/pokedex/';
  const icons = null; // Puedes poner un buffer de imagen o URL

  if (!text) {
    await sock.sendMessage(from, { text: '🚩 *¿Qué Pokémon quieres buscar?*' }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, { react: { text: rwait, key: msg.key } });

  await sock.sendMessage(from, {
    text: `🍟 *Buscando ${text}...*`,
    contextInfo: {
      externalAdReply: {
        title: packname,
        body: dev,
        previewType: 'PHOTO',
        thumbnail: icons,
        mediaType: 1,
        showAdAttribution: true,
        sourceUrl: channel
      }
    }
  }, { quoted: msg });

  try {
    const url = `https://some-random-api.com/pokemon/pokedex?pokemon=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const json = await response.json();

    if (!response.ok || !json || !json.name) {
      await sock.sendMessage(from, { react: { text: error, key: msg.key } });
      await sock.sendMessage(from, { text: '🍟 *¡Oops! No se encontró ese Pokémon o ocurrió un error.*' }, { quoted: msg });
      return;
    }

    const aipokedex = `🚩 *Pokédex - Información de ${json.name}*\n\n` +
      `🍟 *Nombre:* ${json.name}\n` +
      `🍟 *ID:* ${json.id}\n` +
      `🍟 *Tipo:* ${json.type}\n` +
      `🍟 *Habilidades:* ${json.abilities}\n` +
      `🍟 *Tamaño:* ${json.height}\n` +
      `🍟 *Peso:* ${json.weight}\n\n` +
      `📖 *Descripción:*\n${json.description}\n\n` +
      `🔍 *Más info:* https://www.pokemon.com/es/pokedex/${json.name.toLowerCase()}`;

    await sock.sendMessage(from, { text: aipokedex }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: done, key: msg.key } });

  } catch (err) {
    await sock.sendMessage(from, { react: { text: error, key: msg.key } });
    await sock.sendMessage(from, { text: '🍟 *¡Oops! Hubo un error al buscar el Pokémon. Intenta de nuevo más tarde.*' }, { quoted: msg });
  }
}
//Codigo hecho en Black Clover MD
