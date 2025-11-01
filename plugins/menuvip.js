import { cargarDatabase } from '../data/database.js';
import { isVip } from '../utils/vip.js';

export const command = 'menuvip';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const imageUrl = 'http://localhost:8000/upload/412ae089f6d6efe_file_00000000e1f461f883064160b77f7083_wm.png';

  if (!isVip(sender)) {
    await sock.sendMessage(from, { text: '❌ Este menú es solo para usuarios VIP.' });
    return;
  }

  const menuText = `
👑 *MENÚ VIP EXCLUSIVO* 👑
¡Bienvenido al club! Aquí tienes tus comandos VIP.

✨ *Herramientas VIP*
  • *.checkvip*
    > Muestra si eres VIP y el tiempo restante.
  
  • *.rename <personaje> | <nuevo_nombre>*
    > Renombra uno de tus personajes por un costo.

  • *.autoreclamarpzz*
    > Comando para automatizar tus ganancias en la pizzería, ya no necesitas usar .reclamarpzz.

💎 *Recompensas VIP*
  • *.dropvip*
    > Obtén un personaje épico o superior.
    
  • *.magicbox*
    > Abre una caja mágica con premios exclusivos.

⛏️ *Economía VIP*
  • *.superminar*
    > Minado con recompensas duplicadas.

  • *.fusionarvip <p1> | <p2>*
    > Fusiona personajes sin importar la rareza.

`;

  try {
    await sock.sendMessage(from, {
      image: { url: imageUrl },
      caption: menuText.trim(),
      headerType: 4,
      externalAdReply: {
        title: 'Menú de la Pizzería',
        body: 'Comandos para gestionar tu local',
        mediaType: 1,
        thumbnailUrl: imageUrl,
      }
    }, { quoted: msg });
  } catch (error) {
    console.error('❌ Error enviando el menú de la pizzería:', error);
    await sock.sendMessage(from, {
      text: '❌ Ocurrió un error al cargar el menú de la pizzería. Intenta más tarde.',
    }, { quoted: msg });
  }
}
