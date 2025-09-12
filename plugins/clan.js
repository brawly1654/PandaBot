// clan.js
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'clan';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const db = cargarDatabase();
  
  db.users = db.users || {};
  db.clanes = db.clanes || {};

  const subCommand = (args[0] || '').toLowerCase();
  const nombreClan = args.slice(1).join(' ');

  switch (subCommand) {
    case 'crear':
      if (!nombreClan) {
        await sock.sendMessage(from, { text: '❌ Debes poner un nombre para el clan.' }, { quoted: msg });
        return;
      }
      if (Object.keys(db.clanes).includes(nombreClan)) {
        await sock.sendMessage(from, { text: '❌ Ya existe un clan con ese nombre.' }, { quoted: msg });
        return;
      }
      if (getClanDeUsuario(sender, db)) {
        await sock.sendMessage(from, { text: '❌ Ya estás en un clan.' }, { quoted: msg });
        return;
      }
      db.clanes[nombreClan] = {
        creador: sender,
        miembros: [sender],
        recolectados: 0
      };
      guardarDatabase(db);
      await sock.sendMessage(from, { text: `✅ Clan *${nombreClan}* creado.` }, { quoted: msg });
      break;

    case 'unir':
      if (!nombreClan || !db.clanes[nombreClan]) {
        await sock.sendMessage(from, { text: '❌ Clan no encontrado.' }, { quoted: msg });
        return;
      }
      if (getClanDeUsuario(sender, db)) {
        await sock.sendMessage(from, { text: '❌ Ya estás en un clan.' }, { quoted: msg });
        return;
      }
      db.clanes[nombreClan].miembros.push(sender);
      guardarDatabase(db);
      await sock.sendMessage(from, { text: `✅ Te uniste al clan *${nombreClan}*.` }, { quoted: msg });
      break;

    case 'expulsar':
      {
        const clanUser = getClanDeUsuario(sender, db);
        if (!clanUser) {
          await sock.sendMessage(from, { text: '❌ No estás en un clan.' }, { quoted: msg });
          return;
        }
        const clan = db.clanes[clanUser];
        if (clan.creador !== sender) {
          await sock.sendMessage(from, { text: '❌ Solo el creador puede expulsar miembros.' }, { quoted: msg });
          return;
        }
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (!mentioned.length) {
          await sock.sendMessage(from, { text: '❌ Debes mencionar a alguien para expulsar.' }, { quoted: msg });
          return;
        }
        const expulsado = mentioned[0];
        if (!clan.miembros.includes(expulsado)) {
          await sock.sendMessage(from, { text: '❌ Esa persona no está en tu clan.' }, { quoted: msg });
          return;
        }
        clan.miembros = clan.miembros.filter(m => m !== expulsado);
        guardarDatabase(db);
        await sock.sendMessage(from, { text: `✅ Expulsaste a @${expulsado.split('@')[0]}`, mentions: [expulsado] }, { quoted: msg });
      }
      break;

    case 'salir':
      {
        const clanUser = getClanDeUsuario(sender, db);
        if (!clanUser) {
          await sock.sendMessage(from, { text: '❌ No estás en un clan.' }, { quoted: msg });
          return;
        }
        const clan = db.clanes[clanUser];
        clan.miembros = clan.miembros.filter(m => m !== sender);
        if (clan.miembros.length === 0) {
          delete db.clanes[clanUser];
        }
        guardarDatabase(db);
        await sock.sendMessage(from, { text: '✅ Saliste del clan.' }, { quoted: msg });
      }
      break;

    case 'revisar':
      {
        const clanUser = getClanDeUsuario(sender, db);
        if (!clanUser) {
          await sock.sendMessage(from, { text: '❌ No estás en un clan.' }, { quoted: msg });
          return;
        }
        const clan = db.clanes[clanUser];
        let texto = `🏰 *Clan:* ${clanUser}\n👑 Creador: @${clan.creador.split('@')[0]}\n\n👥 Miembros:\n`;
        texto += clan.miembros.map(m => `- @${m.split('@')[0]}`).join('\n');
        texto += `\n\n💰 Pandacoins recolectados: ${clan.recolectados}`;
        await sock.sendMessage(from, { text: texto, mentions: clan.miembros }, { quoted: msg });
      }
      break;

    case 'top':
      {
        if (!Object.keys(db.clanes).length) {
          await sock.sendMessage(from, { text: '📉 No hay clanes registrados.' }, { quoted: msg });
          return;
        }
        const top = Object.entries(db.clanes)
          .sort((a, b) => b[1].recolectados - a[1].recolectados)
          .map(([nombre, data], i) => `${i + 1}. ${nombre} — 💰 ${data.recolectados} pandacoins`)
          .join('\n');
        await sock.sendMessage(from, { text: `🏆 *Top Clanes:*\n\n${top}` }, { quoted: msg });
      }
      break;

    default:
      await sock.sendMessage(from, { text: '📜 Comandos de clan:\n.clan crear <nombre>\n.clan unir <nombre>\n.clan expulsar @usuario\n.clan salir\n.clan revisar\n.clan top' }, { quoted: msg });
  }
}

function getClanDeUsuario(usuario, db) {
  return Object.keys(db.clanes).find(nombre => db.clanes[nombre].miembros.includes(usuario)) || null;
}
