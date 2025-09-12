import { googleImage } from '@bochilteam/scraper';

export const command = 'iaimagen';
//export const aliases = ['img', 'imagen', 'foto'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = args.join(' ').trim();

  // Palabras prohibidas para evitar contenido NSFW
  const prohibidas = [
    'se men', 'hen tai', 'se xo', 'te tas', 'cu lo', 'c ulo', 'cul o', 'ntr', 'rule34',
    'rule', 'caca', 'polla', 'porno', 'porn', 'gore', 'cum', 'semen', 'puta', 'puto',
    'culo', 'putita', 'putito', 'pussy', 'hentai', 'pene', 'coño', 'asesinato', 'zoofilia',
    'mia khalifa', 'desnudo', 'desnuda', 'cuca', 'chocha', 'muertos', 'pornhub', 'xnxx',
    'xvideos', 'teta', 'vagina', 'marsha may', 'misha cross', 'sexmex', 'furry', 'furro',
    'furra', 'panocha', 'pedofilia', 'necrofilia', 'pinga', 'horny', 'ass', 'popo', 'nsfw',
    'femdom', 'futanari', 'erofeet', 'sexo', 'sex', 'yuri', 'ero', 'ecchi', 'blowjob', 'anal',
    'ahegao', 'pija', 'verga', 'trasero', 'violation', 'violacion', 'bdsm', 'cachonda', '+18',
    'cp', 'xxx', 'nuda', 'nude', 'mia marin', 'lana rhoades', 'cepesito', 'hot', 'buceta'
  ];

  // Validar texto
  if (!text) {
    await sock.sendMessage(from, {
      text: `> 🔍 *Uso del comando:*\n> *!iaimagen gato*`,
    }, { quoted: msg });
    return;
  }

  // Detectar contenido prohibido
  if (prohibidas.some(word => text.toLowerCase().includes(word))) {
    await sock.sendMessage(from, {
      text: `⚠️ *No puedo enviar contenido prohibido.*`,
    }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, { react: { text: '🔍', key: msg.key } });

    const res = await googleImage(text);
    const link = res.getRandom(); // Imagen aleatoria

    await sock.sendMessage(from, {
      image: { url: link },
      caption: `🔍 *Imagen relacionada con:* ${text}`,
    }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

  } catch (e) {
    console.error('[ERROR IMG]', e);
    await sock.sendMessage(from, {
      text: `❌ *Ocurrió un error al buscar imágenes.*`,
    }, { quoted: msg });
    await sock.sendMessage(from, { react: { text: '❌', key: msg.key } });
  }
}
