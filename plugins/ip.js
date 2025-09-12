import fetch from 'node-fetch';

export const command = 'ip';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const ipAddress = data.ip;

    await sock.sendMessage(from, {
      text: `Tu dirección IP es: ${ipAddress}`,
      quoted: msg
    });
  } catch (error) {
    console.error('Error al obtener la IP:', error);
    await sock.sendMessage(from, {
      text: 'Error al obtener la dirección IP. Intenta de nuevo más tarde.',
      quoted: msg
    });
  }
}

