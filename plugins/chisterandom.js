import fs from 'fs';
import path from 'path';

const jokesFile = path.resolve('./data/chistes.json');

function loadJokes() {
  if (!fs.existsSync(jokesFile)) {
    return { pendingJokes: [], acceptedJokes: [] };
  }
  return JSON.parse(fs.readFileSync(jokesFile));
}

export const command = 'chisterandom';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const jokes = loadJokes();

  // --- LÍNEA CORREGIDA ---
  if (!jokes.acceptedJokes || jokes.acceptedJokes.length === 0) {
    await sock.sendMessage(from, { text: '❌ Aún no hay chistes aprobados en la lista.' });
    return;
  }
  // --- FIN DE LA CORRECCIÓN ---

  const randomJoke = jokes.acceptedJokes[Math.floor(Math.random() * jokes.acceptedJokes.length)];
  const senderNumber = randomJoke.senderJid.split('@')[0];

  const jokeMessage = `
*Chiste hecho por:* @${senderNumber}
${randomJoke.content}
`;

  await sock.sendMessage(from, { text: jokeMessage, mentions: [randomJoke.senderJid] }, { quoted: msg });
}

