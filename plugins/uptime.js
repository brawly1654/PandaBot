import { getUptime } from '../uptime.js';

export const command = 'uptime';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  
  const uptime = getUptime();
  
  await sock.sendMessage(from, { text: `✅ Llevo en línea: ${uptime}` });
}

