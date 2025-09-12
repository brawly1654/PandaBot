export const command = 'menuaudios';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;

  const menuText = `
🎵 *MENÚ DE COMANDOS DE AUDIO* 🎵
   
¡Responde a un audio para transformarlo con estos efectos!

⚙️ *EFECTOS BÁSICOS*
  • *.fast*
    > Acelera la velocidad del audio.

  • *.slow*
    > Ralentiza la velocidad del audio.

  • *.reverse*
    > Reproduce el audio al revés.

  • *.toaudio*
    > Convierte un video en audio.

🔊 *MODULACIÓN DE VOZ*
  • *.deep*
    > Hace la voz más grave.

  • *.tupai*
    > Hace la voz más aguda (efecto "ardilla").

  • *.robot*
    > Da un efecto robótico a la voz.

  • *.nightcore*
    > Sube el tono y acelera el audio (efecto "nightcore").

  • *.fat*
    > Acelera y baja el tono (efecto "voz gorda").

  • *.tts <texto>*
     > Transforma un texto escrito a voz.

🎶 *EFECTOS DE CALIDAD*
  • *.bass*
    > Realza los bajos del audio.

  • *.earrape*
    > Aumenta drásticamente el volumen del audio.
`;

  await sock.sendMessage(from, { text: menuText.trim() }, { quoted: msg });
}

