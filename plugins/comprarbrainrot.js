export const command = 'comprarbrainrot';
export const tags = ['juegos'];
export const help = ['comprarbrainrot <nombre>'];

export async function run(sock, m, args) {
  const user = m.key.participant || m.key.remoteJid;
  const data = loadData();
  const now = Date.now();

  if (!data[user]) {
    return sock.sendMessage(m.chat, { text: 'Primero usa *!brainrot* para iniciar tu Tycoon.' }, { quoted: m });
  }

  const nombre = args.join(' ');
  const brainrot = brainrots.find(b => b.nombre.toLowerCase() === nombre.toLowerCase());

  if (!brainrot) return sock.sendMessage(m.chat, { text: '❌ Brainrot no encontrado. Usa *!listaBrainrots*' }, { quoted: m });

  if (data[user].dinero < brainrot.precio) return sock.sendMessage(m.chat, { text: '❌ No tienes suficiente dinero.' }, { quoted: m });

  if (data[user].brainrots.includes(brainrot.nombre)) return sock.sendMessage(m.chat, { text: '❌ Ya tienes este brainrot.' }, { quoted: m });

  data[user].dinero -= brainrot.precio;
  data[user].brainrots.push(brainrot.nombre);
  saveData(data);

  sock.sendMessage(m.chat, { text: `✅ Compraste ${brainrot.nombre} por $${brainrot.precio}` }, { quoted: m });
}
