import fs from 'fs';
import path from 'path';

const CREADOR_JID = '56953508566@s.whatsapp.net';
const owners = ['56953508566', '573023181375', '166164298780822']; 
const jokesFile = path.resolve('./data/chistes.json');

function loadJokes() {
  if (!fs.existsSync(jokesFile)) {
    fs.writeFileSync(jokesFile, JSON.stringify({ pendingJokes: [], acceptedJokes: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(jokesFile));
}

function saveJokes(jokes) {
  fs.writeFileSync(jokesFile, JSON.stringify(jokes, null, 2));
}

export const command = 'makechiste';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split('@')[0];

  const subCommand = args[0]?.toLowerCase();

  if (subCommand === 'aceptar' || subCommand === 'rechazar') {
    if (!owners.includes(senderNumber)) {
      await sock.sendMessage(from, { text: '❌ Este comando es solo para los dueños del bot.' });
      return;
    }

    const jokeId = parseInt(args[1]);
    if (isNaN(jokeId)) {
        await sock.sendMessage(from, { text: `❌ Debes proporcionar un ID de chiste válido.` });
        return;
    }
    
    const jokes = loadJokes();
    const jokeIndex = jokes.pendingJokes.findIndex(j => j.id === jokeId);

    if (jokeIndex === -1) {
      await sock.sendMessage(from, { text: `❌ No se encontró un chiste pendiente con ID *#${jokeId}*.` });
      return;
    }

    const joke = jokes.pendingJokes[jokeIndex];
    jokes.pendingJokes.splice(jokeIndex, 1);

    if (subCommand === 'aceptar') {
      jokes.acceptedJokes.push(joke);
      await sock.sendMessage(from, { text: `✅ Chiste #${jokeId} aceptado y guardado.` });
      await sock.sendMessage(joke.senderJid, { text: `🎉 ¡Tu chiste (ID: #${joke.id}) ha sido aprobado! Ahora se mostrará en *.chisteRandom*.` });
    } else {
      const motivo = args.slice(2).join(' ');

      let ownerMessage = `❌ Chiste #${jokeId} rechazado.`;
      if (motivo) {
        ownerMessage += `\n*Motivo:* ${motivo}`;
      }
      
      let userMessage = `💔 Tu chiste (ID: #${joke.id}) ha sido rechazado.`;
      if (motivo) {
        userMessage += `\n*Motivo:* ${motivo}`;
      }

      await sock.sendMessage(from, { text: ownerMessage });
      await sock.sendMessage(joke.senderJid, { text: userMessage });
    }

    saveJokes(jokes);
    return;
  }

  const jokeText = args.join(' ');
  if (!jokeText) {
    await sock.sendMessage(from, { text: '❌ Debes escribir un chiste. Ejemplo: *.makechiste ¿Qué le dice un semáforo a otro? No me mires, me estoy cambiando!*' });
    return;
  }

  const jokes = loadJokes();
  const lastPendingId = jokes.pendingJokes.length > 0 ? Math.max(...jokes.pendingJokes.map(j => j.id)) : 0;
  const lastAcceptedId = jokes.acceptedJokes.length > 0 ? Math.max(...jokes.acceptedJokes.map(j => j.id)) : 0;
  const newId = Math.max(lastPendingId, lastAcceptedId) + 1;

  const newJoke = {
    id: newId,
    senderJid: sender,
    content: jokeText
  };
  jokes.pendingJokes.push(newJoke);
  saveJokes(jokes);

  const notificationText = `
😂 *NUEVO CHISTE PENDIENTE*
*ID:* *#${newId}*
*De:* @${senderNumber}
*Chiste:* ${jokeText}

Para aceptar: *.makechiste aceptar ${newId}*
Para rechazar: *.makechiste rechazar ${newId} [motivo]*
`;

  await sock.sendMessage(CREADOR_JID, { text: notificationText, mentions: [sender] });
  await sock.sendMessage(from, { text: `✅ Tu chiste ha sido enviado para revisión. ID de tu chiste: *#${newId}*.` });
}

