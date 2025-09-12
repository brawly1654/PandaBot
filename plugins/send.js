import fs from 'fs';

export const command = 'send';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const senderRaw = msg.key.participant || msg.key.remoteJid;
  const senderNumber = senderRaw.split('@')[0];
  const ownerNumbers = ['+56953508566', '+573023181375']; // Reemplaza con tus números de owner

  if (!ownerNumbers.includes(`+${senderNumber}`)) {
    return await sock.sendMessage(from, { text: '❌ Solo el owner puede usar este comando.' });
  }

  if (args.length < 2) {
    return await sock.sendMessage(from, { text: '✏️ Uso correcto: .send +56912345678 <texto>' });
  }

  // Validación del número de teléfono (ejemplo con expresión regular)  Mejora esta validación si es necesario
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  let targetNumber = args.shift().replace(/\D/g, '');
  if (!phoneRegex.test(targetNumber)) {
    return await sock.sendMessage(from, { text: '❌ Número de teléfono inválido. Por favor, usa el formato +56912345678' });
  }

  const textToSend = args.join(' ');
  const targetJid = `${targetNumber}@s.whatsapp.net`;

  try {
    await sock.sendMessage(targetJid, {
      text: `👋 Hola usuari@, soy *PandaBot*.\n\n📨 *Un Owner quiere enviarte un mensaje:*\n\n${textToSend}`
    });

    const messageData = {
      sender: senderNumber,
      target: targetJid,
      message: textToSend
    };

    let sentMessages = [];
    try {
      const rawdata = fs.readFileSync('./data/sentMessages.json');
      sentMessages = JSON.parse(rawdata);
    } catch (error) {
      console.log("Archivo sentMessages.json no encontrado. Creando uno nuevo.");
    }

    sentMessages.push(messageData);
    fs.writeFileSync('./data/sentMessages.json', JSON.stringify(sentMessages, null, 2));

    await sock.sendMessage(from, { text: '✅ Mensaje enviado correctamente.' });
  } catch (error) {
    console.error('❌ Error enviando mensaje privado:', error);
    await sock.sendMessage(from, { text: `❌ Error enviando el mensaje: ${error.message}` });
  }
}

