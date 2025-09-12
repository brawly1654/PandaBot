import fetch from 'node-fetch';

export const command = 'dog';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  await sock.sendMessage(from, { text: '🐶 Buscando una imagen de perro...' });

  try {
    const res = await fetch('https://dog.ceo/api/breeds/image/random');
    const data = await res.json();

    if (!data || !data.message) {
      await sock.sendMessage(from, { text: '❌ No se pudo obtener un perro.' });
      return;
    }

    await sock.sendMessage(from, {
      image: { url: data.message },
      caption: '🐶 Aquí tienes un perro aleatorio.'
    });
  } catch (err) {
    console.error('Error dog:', err);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error buscando el perro.' });
  }
}
