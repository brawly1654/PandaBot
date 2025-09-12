import { cargarDatabase } from '../data/database.js';

export const command = 'anunciostotales';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  // Array de dueños del bot
  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665'];
  const isOwner = owners.includes(sender.split('@')[0]);

  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }
  
  const db = cargarDatabase();
  const adCount = db.monetization?.adCount || 0;
  
  await sock.sendMessage(from, { text: `📊 *Total de anuncios vistos:* ${adCount}` });
}

