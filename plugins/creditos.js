export const command = 'creditos';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const imageUrl = 'http://localhost:8000/upload/IMG-20250810-WA0248(1).jpg';

  const texto = `
┏━━━━━━━━━━━━━━━━━━━┓
👑 *Owners:*
+56 9 5350 8566
+57 302 3181375
+52 55 3883 0665

🌐 *Instagram:*
Bot🐼:
https://www.instagram.com/panda.bot2025?igsh=MW1ydDJ1ODJjbzBxNA==

Creador❗️:
https://www.instagram.com/lukas.sec_._?igsh=MWhocXdvZGt5cGtldA==

Owners👑:
https://www.instagram.com/josedavid.martinezarrieta?igsh=bmRmeG01ZDcxNGkx
> Josefino

https://www.instagram.com/miangelnevado?igsh=MWk5cGcxem5zN3p3bA==
> Miguelito

Playtesters🛡:
https://www.instagram.com/jxfed_r.g?igsh=MTBnaWd6MTUxNXNyNA==
> Jafed

https://www.instagram.com/josexo_balatrino?igsh=YzlyM2JiM2psa2I0
> Josexo

https://www.instagram.com/xy77nnn?igsh=MTlhaWpxdmgzZHUyOA==
> José

> Gracias por todo.💗
┗━━━━━━━━━━━━━━━━━━━┛
`.trim();

  await sock.sendMessage(from, {
    image: { url: imageUrl },
    caption: texto
  }, { quoted: msg });
}
