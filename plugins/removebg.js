import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import decode from "image-decode";
import encode from "image-encode";

export const command = "removebg";

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const API_KEY = "szDndFbPyFmCXKnQU82GCGzF";

  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  const mime = quoted?.imageMessage?.mimetype;
  if (!mime) {
    await sock.sendMessage(from, { text: "❌ Responde a una imagen para quitarle el fondo." }, { quoted: msg });
    return;
  }

  try {
    // Descargar imagen WebP
    const bufferWebp = await downloadMediaMessage(
      { message: quoted },
      "buffer",
      {},
      { logger: console }
    );

    // Decodificar a PNG
    const { data, width, height } = decode(bufferWebp);
    const pngBuffer = Buffer.from(encode(data, [width, height], "png"));

    const pngPath = path.join(tmpdir(), `image-${Date.now()}.png`);
    fs.writeFileSync(pngPath, pngBuffer);

    // Crear FormData con Blob nativo
    const formData = new FormData();
    formData.append(
      "image_file",
      new Blob([pngBuffer], { type: "image/png" }),
      "input.png"
    );
    formData.append("size", "auto");

    // Llamada a RemoveBG
    const res = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: { "X-Api-Key": API_KEY },
      body: formData,
    });

    if (!res.ok) {
      console.error("Error API RemoveBG:", await res.text());
      await sock.sendMessage(from, { text: "❌ Error al quitar el fondo." }, { quoted: msg });
      return;
    }

    const bufferOut = Buffer.from(await res.arrayBuffer());
    const outputPath = path.join(tmpdir(), `removebg-${Date.now()}.png`);
    fs.writeFileSync(outputPath, bufferOut);

    await sock.sendMessage(from, { image: fs.readFileSync(outputPath), caption: "✅ Fondo eliminado" }, { quoted: msg });

    fs.unlinkSync(pngPath);
    fs.unlinkSync(outputPath);

  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: "❌ Ocurrió un error al procesar la imagen." }, { quoted: msg });
  }
}
