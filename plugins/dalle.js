import axios from 'axios';

export const command = 'dalle';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (!args.length) {
    await sock.sendMessage(from, {
      text: `✳️ *Usa:*\n.dalle <prompt>\n📌 Ej: *.dalle* una chica guerrera en el espacio estilo anime`
    }, { quoted: msg });
    return;
  }

  const prompt = args.join(' ');
  const apiUrl = `https://api.hiuraa.my.id/ai-img/imagen?text=${encodeURIComponent(prompt)}`;

  await sock.sendMessage(from, {
    react: { text: '🧠', key: msg.key }
  });

  try {
    const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

    if (!response.data) throw new Error('No se pudo generar la imagen.');

    const imageBuffer = Buffer.from(response.data, 'binary');

    await sock.sendMessage(from, {
      image: imageBuffer,
      caption: `🎨 *Prompt:* ${prompt}\n\n🖼️ Imagen generada con DALL·E`,
      mimetype: 'image/jpeg'
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "✅", key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en el comando dalle:", err.message);
    await sock.sendMessage(from, {
      text: `❌ *Ocurrió un error al generar la imagen:*\n_${err.message}_`
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: "❌", key: msg.key }
    });
  }
}

