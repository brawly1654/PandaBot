import fs from 'fs';
import path from 'path';

export const command = 'pandabot';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  
  const pdfPath = path.resolve('./data/documents/guia_oficial.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    await sock.sendMessage(from, { text: '❌ No se encontró el archivo de la guía oficial.' });
    return;
  }
  
  const pdfBuffer = fs.readFileSync(pdfPath);
  
  await sock.sendMessage(from, {
    document: pdfBuffer,
    mimetype: 'application/pdf',
    fileName: 'Guía Oficial de PandaBot.pdf',
    caption: '¡Bienvenido a PandaBot! Aquí está la guía oficial y el reglamento. 🐼'
  });
}

