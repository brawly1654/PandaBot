import { exec } from 'child_process';
import util from 'util';                                                                                  const execPromise = util.promisify(exec);

const personasPermitidas = [
  '56953508566',
  '5215538830665',
  '573023181375',
  '50589329325',
  '267232999420158'
];

export const command = 'pandalogs';

export async function run(sock, msg, args) {                                                                const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const senderNumber = sender.split('@')[0];
  const isAllowed = personasPermitidas.includes(senderNumber);

  if (!isAllowed) {
    await sock.sendMessage(from, { text: '❌ No tienes permiso para usar este comando.' });
    return;
  }

  const loadingMsg = await sock.sendMessage(from, { text: '⏳ Obteniendo los logs de PandaLove...' });

  try {
    const { stdout, stderr } = await execPromise('pm2 logs --nostream PandaLove --lines 50');

    if (stderr) {
      console.error('❌ Error en el comando de terminal:', stderr);
      await sock.sendMessage(from, { text: `❌ Error al ejecutar el comando:\n${stderr}` });
      return;
    }

    if (stdout) {
      await sock.sendMessage(from, { text: `📜 *Logs de PandaLove:*\n\n\`\`\`\n${stdout}\n\`\`\`` });
    } else {
      await sock.sendMessage(from, { text: '❌ No se encontraron logs para PandaLove.' });
    }

  } catch (error) {                                                                                           console.error('❌ Error al ejecutar el comando:', error);
    await sock.sendMessage(from, { text: '❌ Hubo un error inesperado al obtener los logs.' });
  } finally {
  }
}
