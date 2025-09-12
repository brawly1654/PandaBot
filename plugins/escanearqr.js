import axios from 'axios';

export const command = 'escanearqr';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const tipo = Object.keys(msg.message || {})[0];

  if (tipo !== 'imageMessage') {
    return sock.sendMessage(from, { text: '📷 Envía una imagen con un código QR usando el comando *.escanearqr*' });
  }

  const buffer = await sock.downloadMediaMessage(msg);
  const form = new FormData();
  form.append('file', buffer, { filename: 'qr.png' });

  try {
    const { data } = await axios.post('https://api.qrserver.com/v1/read-qr-code/', form, {
      headers: form.getHeaders(),
    });

    const texto = data[0]?.symbol[0]?.data;
    if (texto) {
      await sock.sendMessage(from, { text: `🔎 Código escaneado:\n${texto}` });
    } else {
      await sock.sendMessage(from, { text: '❌ No se pudo leer el código QR.' });
    }
  } catch (err) {
    await sock.sendMessage(from, { text: '❌ Error escaneando el QR.' });
  }
}
