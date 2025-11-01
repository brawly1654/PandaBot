import { exec } from 'child_process';

export const command = 'stop';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const owners = ['56953508566', '573023181375', '166164298780822', '30868416512052', '97027992080542', '5215538830665', '56930617575', '180444930768966'];

  if (!owners.includes(sender.split('@')[0])) {
    await sock.sendMessage(from, { text: '❌ Solo los dueños del bot pueden reiniciarlo.' });
    return;
  }

  await sock.sendMessage(from, { text: '✅ Deteniendo la ejecución del proyecto y PandaLove.' });

  exec('pm2 stop ecosystem.config.cjs', (error, stdout, stderr) => {

    if (error) {
      console.error('❌ Error al ejecutar el script de reinicio:', error.message);
    }
  });

  process.exit(0);
}
