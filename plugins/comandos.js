import fs from 'fs';
import path from 'path';

export const command = 'comandos';

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid;
    const pluginsDir = path.resolve('./plugins');

    try {
        const files = fs.readdirSync(pluginsDir);
        const jsFiles = files.filter(file => file.endsWith('.js'));
        const cantidad = jsFiles.length;

        await sock.sendMessage(from, {
            text: `📜 Este bot tiene *${cantidad}* comandos disponibles.`
        }, { quoted: msg });
    } catch (error) {
        console.error('Error al contar archivos .js:', error);
        await sock.sendMessage(from, {
            text: '❌ Ocurrió un error al contar los comandos.'
        }, { quoted: msg });
    }
}
