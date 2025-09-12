import fs from 'fs';
import { isVip } from '../utils/vip.js';
const afkFile = './data/afk.json';

export const command = 'afk';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const userId = sender.split('@')[0];
 
 if (!isVip(sender)) {
   await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
   return;
  }

  const reason = args.join(' ') || 'AFK';

  if (!fs.existsSync(afkFile)) fs.writeFileSync(afkFile, '{}');
  const afkData = JSON.parse(fs.readFileSync(afkFile));

  afkData[userId] = {
    reason,
    since: Date.now()
  };

  fs.writeFileSync(afkFile, JSON.stringify(afkData, null, 2));

  await sock.sendMessage(from, { react: { text: '🐼', key: msg.key } });
  await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

  await sock.sendMessage(from, {
    text: `🛌 Modo AFK activado.\nMotivo: *${reason}*`
  });
}
