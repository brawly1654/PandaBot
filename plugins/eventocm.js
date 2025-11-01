const ownerNumbers = [
  '+166164298780822', '+56953508566', '+573023181375'
];
export const command = 'eventocm';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
   const sender = msg.key.participant || msg.key.remoteJid;
   const senderNumber = '+' + sender.split('@')[0];

  const isOwner = ownerNumbers.includes(senderNumber);

  if (!isOwner) {
        await sock.sendMessage(from, { text: '🚫 Este comando solo puede usarlo el Creador' }, { quoted: msg });
        return;
    }
  
  const eventos = [
    { mensaje: '🌟 ¡Evento doble monedas! Todos reciben +5.000.000 monedas 🪙', efecto: user => user.coins += 5000000 },
    { mensaje: '🎁 ¡Regalo global! Todos reciben +300 giros ⚡', efecto: user => user.spins += 300 },
    { mensaje: '🛡 ¡Evento de escudos! Todos reciben 1 escudo (máx 2) 🛡', efecto: user => { if (user.shields < 2) user.shields += 1; } },
  ];

  const evento = eventos[Math.floor(Math.random() * eventos.length)];

  for (const u in global.cmDB) {
    evento.efecto(global.cmDB[u]);
  }

  global.guardarCM();
  await sock.sendMessage(from, { text: `🎉 *EVENTO COIN MASTER*\n\n${evento.mensaje}` }, { quoted: msg });
}
