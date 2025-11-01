export const command = 'menujuegos';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const imageUrl = 'http://localhost:8000/upload/9e465f446b584c8_file_00000000aed061f7bbd49e75fc56f43a_wm.png';

  const menuText = `
┣━━━━━━━━━━━━━━━━━━━┫
 🎮 *JUEGOS & FUN*

 🐱 .cat
> El bot muestra una imagen aleatoria de un gato.

 🐕 .dog
> El bot muestra una imagen aleatoria de un perro.

 🎌 .adivinabandera
> Adivina la bandera que muestra el Bot.

 🏅 .ranking
> Muestra el top de personas que mas victorias llevan en .adivinabandera.

 🎗 .ahorcado
> Juegas al clasico juego del ahorcado en el bot.

 🥇 .topahorcados
> Muestra el top de personas con más victorias en ahorcado.

 🫰 .simprate @user
> El bot dice qué tan Simp es el usuario mencionado.

 😎 .facherometro @user
> El bot dice qué tan fachero es el usuario mencionado.

 🌈 .gay @user
> El bot dice qué tan gay es el usuario mencionado.

 🧠 .inteligencia @user
> El bot dice qué tan inteligente es el usuario mencionado.

 💃 .probaile @user
> El bot dice qué tan bueno bailando es el usuario mencionado.

 📺 .otaku @user
> El bot dice qué tan otaku es el usuario mencionado.

 🍀 .luck @user
> El bot dice qué tan suertudo es el usuario mencionado.

 🪙 .moneda
> Lanzas una moneda, puede tocar cara o cruz.

 🎲 .dado
> Lanzas un dado, puede tocar un número del uno al seis.

 🎱 .bolaocho <pregunta>
> Le haces una pregunta a la bola ocho.

 💕 .abrazo @user
> Abrazas al usuario mencionado.

 🤭 .pajer@ @user
> El bot dice qué tan pajero es el usuario mencionado.

 🔥 .topactivos
> El bot muestra el top de personas con más mensajes enviados.

 🔰 .pokedex <pokemon>
> El bot muestra todo sobre el pokemon elegido.

 👅 .paja @user
> Le dedicas una paja al usuario mencionado.😳

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
      text: '❌ Ocurrió un error al cargar el menú de juegos. Intenta más tarde.',
    }, { quoted: msg });
  }
}
