import { ownerNumber } from '../config.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const command = 'aviso';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const isOwner = ownerNumber.includes(`+${sender.split('@')[0]}`);
  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  const messageText = args.join(' ');
  if (!messageText) {
    await sock.sendMessage(from, { text: '❌ Debes escribir un mensaje para enviar. Ejemplo: *.aviso El bot estará en mantenimiento.*' });
    return;
  }

  await sock.sendMessage(from, { text: '⏳ Comenzando el envío de avisos a todos los grupos de forma gradual. Esto puede tardar unos minutos...' });

  try {
    const groups = Object.values(await sock.groupFetchAllParticipating());
    let sentCount = 0;
    
    for (let i = 0; i < groups.length; i += 5) {
      const groupsToSend = groups.slice(i, i + 5);

      for (const group of groupsToSend) {
        try {
          await sock.sendMessage(group.id, { text: `📢 *AVISO DE LOS CREADORES*\n\n${messageText}` });
          sentCount++;
        } catch (e) {
          console.error(`❌ Error al enviar aviso al grupo ${group.subject}: ${e.message}`);
        }
      }

      if (i + 5 < groups.length) {
        await sock.sendMessage(from, { text: '⌛ Esperando 30 segundos antes de enviar el siguiente lote de grupos...' });
        await sleep(15000);
      }
    }

    await sock.sendMessage(from, { text: `✅ Proceso completado. Aviso enviado a *${sentCount}* grupos en total.` });

  } catch (error) {
    console.error('❌ Error en el comando aviso:', error);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error inesperado al enviar el aviso.' });
  }
}

