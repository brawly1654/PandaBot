import fs from 'fs';

export const command = 'registrarcm';
//export const aliases = ['regcm'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const nombre = args.join(' ');

  if (!nombre) {
    await sock.sendMessage(from, {
      text: `❗ Usa el comando así:\n.registrarCM <tu nombre>\n\nEjemplo:\n.registrarCM Juanito`
    }, { quoted: msg });
    return;
  }

  if (!global.cmDB[sender]) {
    global.cmDB[sender] = {};
  }

  global.cmDB[sender].nombre = nombre;

  guardarCM();

  // Guardamos en el archivo coinmaster.json
  fs.writeFileSync('./coinmaster.json', JSON.stringify(global.cmDB, null, 2));

  await sock.sendMessage(from, {
    text: `✅ Te has registrado exitosamente como *${nombre}* para el modo Coin Master.`,
  }, { quoted: msg });
}
