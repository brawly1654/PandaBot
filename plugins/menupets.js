import fs from 'fs';

export const command = 'menupets';

export async function run(sock, msg) {
    const from = msg.key.remoteJid;

    const menuImagePath = 'http://localhost:8000/upload/8eade767c0ad420_file_00000000640c6246a65474aa89dad162_wm.png'; 

    const menuText = `
🐾 *COMANDOS DE MASCOTAS* 🐾
---------------------------
*🎉 Empezar:*
 • *.newpet:* Consigue una mascota aleatoria.
 • *.petname <nombre>*: Dale un nombre a tu mascota.

*🐶 Cuidar:*
 • *.mypet*: Ver el estado de tu mascota (vida, hambre, felicidad).
 • *.alimentarpet*: Dale de comer a tu mascota (cuesta pandacoins).
 • *.jugarpet*: Juega con tu mascota para aumentar su felicidad.

*💖 En pareja:*
 • *.invitar <@usuario>*: Invita a alguien a ser co-propietario.
 • *.petimg <citar imagen>*: Establece una foto para tu mascota.
    `;
    
    if (fs.existsSync(menuImagePath)) {
        const imageBuffer = fs.readFileSync(menuImagePath);
        await sock.sendMessage(from, { image: imageBuffer, caption: menuText });
    } else {
        await sock.sendMessage(from, { text: menuText });
    }
}

