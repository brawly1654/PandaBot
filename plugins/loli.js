import axios from 'axios';

export const command = 'loli';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const res = await axios.get('https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/JSON/nsfwloli.json');
    const url = res.data[Math.floor(Math.random() * res.data.length)];

    await sock.sendMessage(from, {
      image: { url },
      caption: '🤭🤭🤭'
    }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: '😳', key: msg.key } });

  } catch (e) {
    console.error('❌ Error en comando loli:', e);
    await sock.sendMessage(from, {
      text: '❌ No se pudo obtener el contenido.'
    }, { quoted: msg });
  }
}
