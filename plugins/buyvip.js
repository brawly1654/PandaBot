import { cargarDatabase, guardarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js';

export const command = 'buyvip';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  if (isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ ¡Ya eres un usuario VIP! No necesitas comprar un ticket.' });
    return;
  }

  const db = cargarDatabase();
  db.users = db.users || {};
  const user = db.users[sender] || { pandacoins: 0 };
  
  const ticketCost = 300000;
  const subCommand = args[0]?.toLowerCase();

  if (subCommand === 'ticket') {
    if (user.pandacoins < ticketCost) {
      await sock.sendMessage(from, { text: `❌ No tienes suficientes pandacoins para comprar un ticket VIP. Cuesta *${ticketCost}* pandacoins.` });
      return;
    }
    
    user.pandacoins -= ticketCost;
    user.vip = true;
    user.vipExpiration = Date.now() + 24 * 60 * 60 * 1000;
    guardarDatabase(db);
    
    await sock.sendMessage(from, { text: `✅ ¡Felicidades! Has comprado un ticket VIP por 24 horas. Disfruta de los beneficios.` });
    return;
  }

  const creatorContact = '+56 9 5350 8566';
  const message = `
👑 *COMPRAR MEMBRESÍA VIP* 👑

Para adquirir el estatus VIP, contacta al creador:
📞 *Contacto:* ${creatorContact}

*Precios:*
- 💰 *1 Semana:* $1 USD
- 💰 *1 Mes:* $3 USD
- 💰 *De por vida:* $5 USD

---------------------------
🎟️ *TICKET VIP (24 horas)*
Si no puedes pagar, puedes comprar un ticket VIP por 24 horas con Pandacoins.
Costo: *${ticketCost}* Pandacoins
Tu saldo: *${user.pandacoins || 0}* Pandacoins

Para comprar:
*.buyvip ticket*

---------------------------
*Otros métodos*💎(Requiere contactar al creador):

- 👾 *Brawl Pass de Brawl Stars*
- 👾 *Robux en Roblox*
- 👾 *Brainrots de Steal a Brainrot*
- 👾 *Pass Royale de Clash Royale* (Más beneficios)`;

  await sock.sendMessage(from, { text: message });
}

