import fetch from 'node-fetch';

export const command = 'qr';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const texto = args.join(' ');
  if (!texto) return await sock.sendMessage(from, { text: '✏️ Escribe el texto para generar el QR.\nEjemplo: *qr Hola mundo*' });

  const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(texto)}`;
  await sock.sendMessage(from, {
    image: { url },
    caption: `📦 QR generado para: ${texto}`
  });
}
