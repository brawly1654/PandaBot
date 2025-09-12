export const command = 'rankingcm';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;

  const top = Object.entries(global.cmDB)
    .map(([user, data]) => ({ user, coins: data.coins }))
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 5);

  if (top.length === 0) {
    await sock.sendMessage(from, { text: `📉 No hay datos para mostrar en el ranking.` }, { quoted: msg });
    return;
  }

  const texto = top.map((t, i) => `*${i + 1}.* +${t.user} – 💰 ${t.coins} monedas`).join('\n');

  await sock.sendMessage(from, {
    text: `🏆 *TOP 5 COIN MASTER* 🏆\n\n${texto}`
  }, { quoted: msg });
}
