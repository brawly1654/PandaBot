export const command = 'logs';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665'];
  const isOwner = owners.includes(sender.split('@')[0]);

  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  if (global.terminalLogs.length === 0) {
    await sock.sendMessage(from, { text: '❌ No se encontraron logs de comandos.' });
    return;
  }

  const logMessage = `📜 *Últimos comandos usados:*\n\n` + global.terminalLogs.join('\n');
  await sock.sendMessage(from, { text: logMessage });
}

