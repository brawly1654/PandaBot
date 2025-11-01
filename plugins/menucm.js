export const command = 'menucm';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/PandaBot%20VIP%F0%9F%A7%90%F0%9F%AA%84%2020250916_151426.jpg';

  const menuText = `
┣━━━━━━━━━━━━━━━━━━━┫
 *💰COIN MASTER SYSTEM*

 💰 .tirar
> Haces un giro en el que puedes conseguir diferentes recursos.(coins, tiros, creditos y escudos)

 💰 .walletcm
> Revisas tu inventario de recursos.

 💰 .tirar10
> Haces 10 giros seguidos.

 💰 .tirar20
> Haces 20 giros seguidos.

 💰 .mejorar
> Mejoras tu Aldea a cambio de coins.

 💰 .dailycm
> Reclamas tu recompensa diaria de tiros.

 💰 .atacar @user
> Atacas al usuario mencionado para intentar quitarle recursos.

 💰 .robar @user
> Le robas recursos al usuario mencionado.

 💰 .regalartiros <cantidad> @user
> Le regalas una cantidad de tiros al usuario mencionado.

 💰 .megatirar
> Haces 30 giros seguidos.

 💰 .eventocm (owner)
> Haces un evento global donde TODOS consiguen recursos.

 💰 .pay @user <cantidad>
> Le pagas Coins al usuario mencionado.

┣━━━━━━━━━━━━━━━━━━━┫
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
      text: '❌ Ocurrió un error al cargar el menú de Coin Master. Intenta más tarde.',
    }, { quoted: msg });
  }
}
