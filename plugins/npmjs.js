import fetch from 'node-fetch';
import { ownerNumber } from '../config.js';

export const command = 'npmjs';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const text = args.join(' ');

  if (!text) {
    await sock.sendMessage(from, { text: '🚩 Escribe el nombre del paquete que quieres buscar.\n\nEjemplo: !npmjs yt-search' }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, { text: '🔍 Buscando el paquete en npmjs.com...' }, { quoted: msg });

    const res = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.objects.length) {
      await sock.sendMessage(from, { text: `❌ No se encontraron resultados para: *${text}*` }, { quoted: msg });
      return;
    }

    const results = json.objects.map(({ package: pkg }) => {
      return `📦 *Nombre:* ${pkg.name}\n📌 *Versión:* ${pkg.version}\n🔗 *Enlace:* ${pkg.links.npm}\n📝 *Descripción:* ${pkg.description || 'Sin descripción'}`;
    }).join('\n\n────────────\n\n');

    await sock.sendMessage(from, { text: `*Resultados para:* ${text}\n\n${results}` }, { quoted: msg });

  } catch (e) {
    console.error(e);
    await sock.sendMessage(from, { text: '❌ Ocurrió un error al buscar el paquete.' }, { quoted: msg });
  }
}
