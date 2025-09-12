import axios from 'axios';

export const command = 'cr7';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const res = await axios.get('https://meme-api.herokuapp.com/gimme/Cristianoronaldo');
    const json = res.data;
    const url = json.url;

    const caption = `*Siiiuuuuuu* 🐼⚽\nFuente: r/Cristianoronaldo`;

    await sock.sendMessage(from, {
      image: { url },
      caption,
      mentions: [],
    }, { quoted: msg });
  } catch (err) {
    console.error('❌ Error al obtener meme de Cristiano Ronaldo:', err);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al obtener la imagen. Intenta nuevamente.' }, { quoted: msg });
  }
}
