export const command = '8ball';

const respuestas = [
  "Sí, sin lugar a dudas.",
  "Es muy probable.",
  "Parece que sí.",
  "Las señales apuntan a que sí.",
  "No cuentes con ello.",
  "Mi respuesta es no.",
  "No es muy prometedor.",
  "Definitivamente no.",
  "La respuesta es incierta, pregunta de nuevo.",
  "Mejor no te digo ahora.",
  "Concéntrate y pregunta de nuevo."
];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  if (args.length === 0) {
    await sock.sendMessage(from, { text: `Hazme una pregunta para que la bola mágica responda. Ejemplo: *!8ball Debería comer pizza hoy?*` });
    return;
  }

  const pregunta = args.join(' ');
  const respuestaAleatoria = respuestas[Math.floor(Math.random() * respuestas.length)];

  const responseText = `🎱 La bola 8 mágica dice:\n*${respuestaAleatoria}*`;

  await sock.sendMessage(from, { text: responseText });
}

