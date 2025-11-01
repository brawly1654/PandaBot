export const command = 'miloj';
export const aliases = ['milo'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  // Lista de imágenes de Milo J
  const imagenesMiloJ = [
    'https://files.catbox.moe/uirjt1.png',
    'https://files.catbox.moe/0q1une.png',
    'https://files.catbox.moe/y07jn0.png',
    'https://files.catbox.moe/khovlm.png',
    'https://files.catbox.moe/43l3y4.png',
    'https://files.catbox.moe/fxob6p.png',
    'https://files.catbox.moe/uw1jkv.png',
    'https://files.catbox.moe/riu2p7.png',
    'https://files.catbox.moe/n9pcmp.png',
    'https://files.catbox.moe/3kh2m3.png',
    'https://files.catbox.moe/j15p39.png',
    'https://files.catbox.moe/jopu1d.png',
    'https://files.catbox.moe/vedbnl.png',
    'https://files.catbox.moe/4586hs.png',
    'https://files.catbox.moe/g9vpev.png',
    'https://files.catbox.moe/zfddsh.png',
    'https://files.catbox.moe/f3b1ms.png',
    'https://files.catbox.moe/qj0mmh.png',
    'https://files.catbox.moe/cpdklt.png',
    'https://files.catbox.moe/shxjd4.png',
    'https://files.catbox.moe/8m213f.png'
  ];

  // Imagen aleatoria
  const randomImg = imagenesMiloJ[Math.floor(Math.random() * imagenesMiloJ.length)];

  await sock.sendMessage(from, {
    image: { url: randomImg },
    caption: `🎤 Foto aleatoria de *Milo J*`
  }, { quoted: msg });
}
