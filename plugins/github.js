import fetch from 'node-fetch';
import fs from 'fs';

// Asegúrate de tener estas variables o reacciones definidas:
const rwait = '⏳';
const done = '✅';
const error = '❌';

export const command = 'githubsearch';
//export const aliases = ['ghsearch', 'ghrepo'];

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = args.join(' ');
  const { sendMessage } = sock;

  if (!text) {
    await sock.sendMessage(from, {
      text: `🚩 *Ingrese el nombre de un repositorio de GitHub*\n\nEjemplo: *!githubsearch whatsapp-bot*`,
    }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, { react: { text: rwait, key: msg.key } });

    const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.items || json.items.length === 0) throw new Error('Sin resultados');

    const resultados = json.items.map((repo, i) => {
      return `
🍟 *Resultado:* ${i + 1}
🔗 *Enlace:* ${repo.html_url}
👑 *Creador:* ${repo.owner.login}
📦 *Nombre:* ${repo.name}
📅 *Creado:* ${formatDate(repo.created_at)}
♻️ *Actualizado:* ${formatDate(repo.updated_at)}
👁️ *Vigilado:* ${repo.watchers}
🍴 *Forks:* ${repo.forks}
⭐️ *Estrellas:* ${repo.stargazers_count}
❗ *Issues:* ${repo.open_issues}
📝 *Descripción:* ${repo.description || 'Sin descripción'}
🧬 *Clone:* ${repo.clone_url}
`.trim();
    }).join('\n\n──────────────────────\n\n');

    const avatarUrl = json.items[0].owner.avatar_url;
    const imgBuffer = await fetch(avatarUrl).then(res => res.buffer());

    await sock.sendMessage(from, {
      image: imgBuffer,
      caption: `🍟 *GITHUB SEARCH: ${text}*\n\n${resultados}`,
    }, { quoted: msg });

    await sock.sendMessage(from, { react: { text: done, key: msg.key } });

  } catch (err) {
    console.error('❌ Error:', err);
    await sock.sendMessage(from, { react: { text: error, key: msg.key } });
    await sock.sendMessage(from, {
      text: `🚩 *No se encontraron resultados para:* ${text}`,
    }, { quoted: msg });
  }
}

// Función auxiliar para formatear fechas
function formatDate(n, locale = 'es') {
  const d = new Date(n);
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
}
