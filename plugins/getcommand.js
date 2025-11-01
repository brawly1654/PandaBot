import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const command = 'getcommand';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const owners = ['56953508566', '573023181375', '166164298780822', '5215538830665', '267232999420158'];
  
  const isOwner = owners.includes(sender.split('@')[0]);
  if (!isOwner) {
    await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
    return;
  }

  const commandName = args[0];

  if (!commandName) {
    await sock.sendMessage(from, { text: '❌ Debes especificar el nombre del comando. Ejemplo: *.getcommand ping*' }, { quoted: msg });
    return;
  }

  const filePath = path.join(__dirname, `${commandName}.js`);

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    const message = `
${fileContent}
`;
    await sock.sendMessage(from, { text: message }, { quoted: msg });

  } catch (error) {
    console.error(`❌ Error al obtener el comando ${commandName}:`, error);
    await sock.sendMessage(from, { text: `❌ No se pudo encontrar el comando *${commandName}* o el archivo no existe.` }, { quoted: msg });
  }
}

