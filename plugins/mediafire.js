import fetch from 'node-fetch';

export const command = 'mediafire';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const text = args.join(" ");
  const pref = '.'; // Puedes cambiar el prefijo si usas otro

  if (!text) {
    await sock.sendMessage(from, {
      text: `⚠️ *Uso incorrecto.*\n📌 Ejemplo:\n${pref}${command} https://www.mediafire.com/file/ejemplo/file.zip`
    }, { quoted: msg });
    return;
  }

  if (!/^https?:\/\/(www\.)?mediafire\.com/.test(text)) {
    await sock.sendMessage(from, {
      text: `⚠️ *Enlace no válido.*\n📌 Asegúrate de ingresar una URL de MediaFire válida.\n\nEjemplo:\n${pref}${command} https://www.mediafire.com/file/ejemplo/file.zip`
    }, { quoted: msg });
    return;
  }

  await sock.sendMessage(from, {
    react: { text: '⏳', key: msg.key }
  });

  try {
    const apiUrl = `https://api.neoxr.eu/api/mediafire?url=${encodeURIComponent(text)}&apikey=russellxz`;
    const response = await fetch(apiUrl);

    if (!response.ok) throw new Error(`API error: ${response.statusText}`);
    const data = await response.json();

    if (!data.status || !data.data?.url) throw new Error("No se pudo obtener el enlace de descarga.");

    const fileInfo = data.data;
    const fileResponse = await fetch(fileInfo.url);
    if (!fileResponse.ok) throw new Error("No se pudo descargar el archivo.");

    const fileBuffer = await fileResponse.buffer();

    const caption =
      `𖠁 *Nombre:* ${fileInfo.title}\n` +
      `𖠁 *Tamaño:* ${fileInfo.size}\n` +
      `𖠁 *Tipo:* ${fileInfo.mime}\n` +
      `𖠁 *Extensión:* ${fileInfo.extension}\n\n────────────\n𖠁 _La Suki Bot_`;

    await sock.sendMessage(from, {
      text: caption
    }, { quoted: msg });

    await sock.sendMessage(from, {
      document: fileBuffer,
      mimetype: fileInfo.mime,
      fileName: fileInfo.title
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: '✅', key: msg.key }
    });

  } catch (err) {
    console.error("❌ Error en mediafire:", err);
    await sock.sendMessage(from, {
      text: `❌ *Error al procesar MediaFire:*\n_${err.message}_`
    }, { quoted: msg });

    await sock.sendMessage(from, {
      react: { text: '❌', key: msg.key }
    });
  }
}
