import { exec } from 'child_process';

export const command = 'reiniciar';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const owners = ['56953508566', '573023181375', '166164298780822', '30868416512052', '97027992080542', '5215538830665', '267232999420158'];

  if (!owners.includes(sender.split('@')[0])) {
    await sock.sendMessage(from, { text: '❌ Solo los dueños del bot pueden reiniciarlo.' });
    return;
  }

  await sock.sendMessage(from, { text: '✅ PandaBot reiniciado exitosamente. Espera unos segundos...' });

  exec('cd PandaLove && git pull origin main && cd .. && pm2 restart ecosystem.config.cjs', (error, stdout, stderr) => {

    if (error) {
      console.error('❌ Error al ejecutar el script de reinicio:', error.message);
    }
  });

  process.exit(0);
}

