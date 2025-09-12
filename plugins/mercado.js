export const command = 'mercado';

export async function run(sock, msg) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;

  const items = [
    {
      nombre: 'Guante de Gato',
      precio: 10000,
      descripcion: 'Aumenta tu probabilidad de éxito en el robo en un 10%. (1 uso)',
      emoji: '🧤'
    },
    {
      nombre: 'Máscara de Zorro',
      precio: 20000,
      descripcion: 'Duplica las ganancias de tu próximo robo exitoso. (1 uso)',
      emoji: '🦊'
    },
    {
      nombre: 'Escudo Antirrobo',
      precio: 50000,
      descripcion: 'Te protege de un solo robo por 24 horas.',
      emoji: '🛡️'
    },
    {
      nombre: 'Pase de Salida',
      precio: 15000,
      descripcion: 'Te permite robar de nuevo, ignorando el cooldown de 3 horas. (1 uso)',
      emoji: '🎫'
    }
  ];

  let mensaje = '🛒 *Mercado Negro de PandaBot* 🛒\n\n';
  mensaje += '¡Usa tus Pandacoins para mejorar tus habilidades de robo!\n\n';
  
  items.forEach(item => {
    mensaje += `${item.emoji} *${item.nombre}*\n`;
    mensaje += `  - 💰 Precio: ${item.precio.toLocaleString()} Pandacoins\n`;
    mensaje += `  - 📝 Descripción: ${item.descripcion}\n\n`;
  });
  
  mensaje += `📌 Uso: *.buy <nombre_del_item>*`;

  await sock.sendMessage(from, { text: mensaje });
}

