import { exec } from 'child_process';
import { ownerNumber } from '../config.js'; // Asegúrate de tener tu número en config.js

export const command = 'restart';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (sender !== ownerNumber) {
    await sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando.' });
    return;
  }

  await sock.sendMessage(from, { text: '♻️ Reiniciando el bot...' });

  // Ejecuta el script
  exec('./restart.sh', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al reiniciar: ${error.message}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  });
}

//pene este comando no funciona
