import { runPzz } from '../PandaLove/pizzeria.js';

export const command = 'runpzz';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665', '267232999420158'];
  const isOwner = owners.includes(sender.split('@')[0]);

  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  const action = args.join(' ');
  if (!action) {
    await sock.sendMessage(from, { text: '❌ Debes especificar una acción. Ejemplo: *.runpzz ganancia_doble*' });
    return;
  }

  try {
    const response = await runPzz(action);

    if (response.number !== 200) {
      await sock.sendMessage(from, { text: `❌ ${response.error || 'Error desconocido'}` });
      return;
    }

    await sock.sendMessage(from, { text: `✅ ${response.message}` });

  } catch (e) {
    console.error('❌ Error en el comando runpzz:', e);
    await sock.sendMessage(from, { text: '❌ Hubo un error de conexión con la API de la pizzería.' });
  }
}

