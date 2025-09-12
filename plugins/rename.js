import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js';

export const command = 'rename';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  
  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para usuarios VIP.' });
    return;
  }
  
  if (!args.length || !args.join(' ').includes('|')) {
    await sock.sendMessage(from, { text: '❌ Uso: *.rename <nombre_personaje> | <nuevo_nombre>*' });
    return;
  }

  const [nombreViejo, nombreNuevo] = args.join(' ').split('|').map(a => a.trim());
  
  if (!nombreViejo || !nombreNuevo) {
    await sock.sendMessage(from, { text: '❌ Debes proporcionar el nombre del personaje y el nuevo nombre.' });
    return;
  }

  const db = cargarDatabase();
  const user = db.users[sender];

  if (!user || !user.personajes.includes(nombreViejo)) {
    await sock.sendMessage(from, { text: `❌ No tienes un personaje llamado *${nombreViejo}* en tu inventario.` });
    return;
  }

  // Encontrar y reemplazar el nombre
  const index = user.personajes.findIndex(p => p === nombreViejo);
  if (index !== -1) {
    user.personajes[index] = nombreNuevo;
    guardarDatabase(db);
    await sock.sendMessage(from, { text: `✅ ¡Personaje renombrado! *${nombreViejo}* ahora se llama *${nombreNuevo}*.` });
  } else {
    await sock.sendMessage(from, { text: '❌ Hubo un error al renombrar el personaje. Intenta de nuevo.' });
  }
}

