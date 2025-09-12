import chalk from 'chalk';
import { cargarDatabase, guardarDatabase } from './data/database.js';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import { prefix, ownerNumber } from './config.js';
import * as ping from './plugins/ping.js';
import * as mediafire from './plugins/mediafire.js';
import * as registrar from './plugins/registrar.js';
import * as inforegistrar from './plugins/inforegistrar.js';
import * as pareja from './plugins/pareja.js';
import * as enable from './plugins/enable.js';
import * as disable from './plugins/disable.js';
import * as menu from './plugins/menu.js';
import * as configmenu from './plugins/configmenu.js';
import * as topparejas from './plugins/topparejas.js';
import * as love from './plugins/love.js';
import * as calcularamor from './plugins/calcularamor.js';
import * as hidetag from './plugins/hidetag.js';
import * as invocar from './plugins/invocar.js';
import * as topactivos from './plugins/topactivos.js';
import * as gay from './plugins/gay.js';
import * as simprate from './plugins/simprate.js';
import * as pajero from './plugins/pajero.js';
import * as ship from './plugins/ship.js';
import * as beso from './plugins/beso.js';
import * as abrazo from './plugins/abrazo.js';
import * as dado from './plugins/dado.js';
import * as moneda from './plugins/moneda.js';

import * as facherometro from './plugins/facherometro.js';
import * as inteligencia from './plugins/inteligencia.js';
import * as otaku from './plugins/otaku.js';
import * as probaile from './plugins/probaile.js';
import * as luck from './plugins/luck.js';
import * as adivinabandera from './plugins/adivinabandera.js';
import * as topbanderas from './plugins/topbanderas.js';
import * as send from './plugins/send.js';
import * as squidgame from './plugins/squidgame.js';
import * as warn from './plugins/warn.js';
import * as unwarn from './plugins/unwarn.js';
import * as advertencias from './plugins/advertencias.js';
import * as trabajar from './plugins/trabajar.js';
import * as aventura from './plugins/aventura.js';
import * as perfil from './plugins/perfil.js';
import * as cazar from './plugins/cazar.js';
import * as promote from './plugins/promote.js';
import * as demote from './plugins/demote.js';
import * as groupinfo from './plugins/groupinfo.js';
import * as viewps from './plugins/viewps.js';
import * as buy from './plugins/buy.js';
import * as misps from './plugins/misps.js';
import * as daily from './plugins/daily.js';
import * as hourly from './plugins/hourly.js';
import * as weekly from './plugins/weekly.js';
import * as monthly from './plugins/monthly.js';
import * as ps from './plugins/ps.js';
import * as sell from './plugins/sell.js';
import * as robarps from './plugins/robarps.js';
import * as regalarps from './plugins/regalarps.js';
import * as addps from './plugins/addps.js';
import * as delps from './plugins/delps.js';
import * as play from './plugins/play.js';
import * as banuser from './plugins/banuser.js';
import * as unbanuser from './plugins/unbanuser.js';
import * as ban from './plugins/cum.js';
import * as tts from './plugins/tts.js';
import * as tiktok from './plugins/tiktok.js';
import * as instagram from './plugins/instagram.js'; 
import * as chatgpt from './plugins/chatgpt.js';
import * as kiss from './plugins/kiss.js';
import * as pfp from './plugins/pfp.js';
import * as minar from './plugins/minar.js';
import * as styletext from './plugins/styletext.js';
import * as tirar from './plugins/tirar.js';
import * as dailycm from './plugins/dailycm.js';
import * as musica from './plugins/musica.js';
import * as walletcm from './plugins/walletcm2.js';
import * as atacar from './plugins/atacar.js';
import * as robar from './plugins/robar.js';
import * as mejorar from './plugins/mejorar.js';
import * as nuke from './plugins/nuke.js';
import * as ytmp4 from './plugins/ytmp4.js';
import * as ytmp3 from './plugins/ytmp3.js';
import * as eventocm from './plugins/eventocm.js';
import * as megatirar from './plugins/tirar10.js';
import * as regalartiros from './plugins/regalartiros.js';
import * as rankingcm from './plugins/rankingcm.js';
import * as pinterest from './plugins/pinterest.js';
import * as pokedex from './plugins/pokedex.js';
import * as githubsearch from './plugins/github.js';
import * as miloj from './plugins/miloj.js';
import * as usuarios from './plugins/usuarios.js';
import * as doxx from './plugins/doxx.js';
import * as addps2 from './plugins/addps2.js';
import * as pay from './plugins/tr.js';
import * as recolectar from './plugins/recolectar.js';
import * as ordenarps from './plugins/ordenarps.js';
import * as tirar10 from './plugins/tirar2.js';
import * as tirar20 from './plugins/tirar20.js';
import * as twitter from './plugins/twitter.js';
import * as letra from './plugins/letra.js';
import * as topcoins from './plugins/topcoins.js';
import * as creditos from './plugins/creditos.js';
import * as cofre from './plugins/cofre.js';
import * as paja from './plugins/paja.js';
import * as sexo from './plugins/sexo.js';
import * as grupo from './plugins/grupo.js';
import * as mute from './plugins/mute.js';
import * as unmute from './plugins/unmute.js';
import * as youtube from './plugins/youtube.js';
import * as cat from './plugins/cat.js';
import * as qr from './plugins/qr.js';
import * as acortar from './plugins/acortar.js';
import * as tiempo from './plugins/tiempo.js';
import * as escanearqr from './plugins/escanearqr.js';
import * as dog from './plugins/dog.js';
import * as estado from './plugins/estado.js';
import * as whereps from './plugins/whereps.js';
import * as tiktoksearch from './plugins/tiktoksearch.js';
import * as definir from './plugins/definir.js';
import * as coronar from './plugins/coronar.js';
import * as afk from './plugins/afk.js';
import * as manuela from './plugins/manuela.js';
import * as secret from './plugins/secret.js';
import * as enigma from './plugins/enigma.js';
import * as lol from './plugins/lol.js';
import * as cr7 from './plugins/cr7.js';
import * as furry from './plugins/furry.js';
import * as reiniciar from './plugins/reiniciar.js';
import * as addps3 from './plugins/addps3.js';
import * as npmjs from './plugins/npmjs.js';
import * as pornhubdl from './plugins/pornhubdl.js';
import * as añadirps from './plugins/añadirps.js';
import * as toppersonajes from './plugins/toppersonajes.js';
import * as checkps from './plugins/checkps.js';
import * as drop from './plugins/drop.js';
import * as verps from './plugins/verps.js';
import * as descps from './plugins/descps.js';
import * as toaudio from './plugins/toaudio.js';
import * as tungtungtungsahur from './plugins/tungtungtungsahur.js';
import * as garammaram from './plugins/garammaram.js';
import * as tralalerotralala from './plugins/tralalerotralala.js';
import * as lavacca from './plugins/lavacca.js';
import * as lostralaleritos from './plugins/lostralaleritos.js';
import * as lastralaleritas from './plugins/lastralaleritas.js';
import * as agarrinilapalini from './plugins/agarrinilapalini.js';
import * as bonecaambalabu from './plugins/bonecaambalabu.js';
import * as girafaceleste from './plugins/girafaceleste.js';
import * as grancombinasion from './plugins/grancombinasion.js';
import * as lirililarila from './plugins/lirililarila.js';
import * as chicleteira from './plugins/chicleteira.js';
import * as brrbrrpatapim from './plugins/brrbrrpatapim.js';
import * as frulifrula from './plugins/frulifrula.js';
import * as s from './plugins/s.js';
import * as fast from './plugins/fast.js';
import * as slow from './plugins/slow.js';
import * as qc from './plugins/qc.js';
import * as marry from './plugins/marry.js';
import * as divorcio from './plugins/divorcio.js';
import * as aceptar from './plugins/aceptar.js';
import * as waifu from './plugins/waifu.js';
import * as hola from './plugins/hola.js';
import * as ruletarusa from './plugins/ruletarusa.js';
import * as addps4 from './plugins/addps4.js';
import * as checkowner from './plugins/checkowner.js';
import * as basbas from './plugins/basbas.js';
import * as addowner from './plugins/addowner.js';
import * as delowner from './plugins/delowner.js';
import * as add from './plugins/add.js';
import * as penalizar from './plugins/penalizar.js';
import * as addpokemonall from './plugins/addpokemonall.js';
import * as mejorarps from './plugins/mejorarps.js';
import * as apostar from './plugins/apostar.js';
import * as fusionarps from './plugins/fusionarps.js';
import * as clan from './plugins/clan.js';
import * as removebg from './plugins/removebg.js';
import * as bloquearpalabra from './plugins/bloquearpalabra.js';
import * as noafk from './plugins/noafk.js';
import * as xdl from './plugins/xdl.js';
import * as comandos from './plugins/comandos.js';
import * as buscar from './plugins/buscar.js';
import * as bolaocho from './plugins/bolaocho.js';
import * as ahorcado from './plugins/ahorcado.js';
import * as topahorcados from './plugins/topahorcados.js';
import * as regpizzeria from './plugins/regpizzeria.js';
import * as mipizzeria from './plugins/mipizzeria.js';
import * as pzzname from './plugins/pzzname.js';
import * as reclamarpzz from './plugins/reclamarpzz.js';
import * as viewsv from './plugins/viewsv.js';
import * as contratarsv from './plugins/contratarsv.js';
import * as descontratarsv from './plugins/descontratarsv.js';
import * as missv from './plugins/missv.js';
import * as pandalogs from './plugins/pandalogs.js';
import * as reverse from './plugins/reverse.js';
import * as bass from './plugins/bass.js';
import * as earrape from './plugins/earrape.js';
import * as tupai from './plugins/tupai.js';
import * as nightcore from './plugins/nightcore.js';
import * as deep from './plugins/deep.js';
import * as robot from './plugins/robot.js';
import * as fat from './plugins/fat.js';
import * as solicitarespejo from './plugins/solicitarespejo.js';
import * as revisarpeticiones from './plugins/revisarpeticiones.js';
import * as aceptarpeticion from './plugins/aceptarpeticion.js';
import * as lvlpizzeria from './plugins/lvlpizzeria.js';
import * as comprarasiento from './plugins/comprarasiento.js';
import * as lvlup from './plugins/lvlup.js';
import * as imagenpizzeria from './plugins/imagenpizzeria.js';
import * as mylid from './plugins/mylid.js';
import * as toppizzerias from './plugins/toppizzerias.js';
import * as lyrics from './plugins/lyrics.js';
import * as menupizzeria from './plugins/menupizzeria.js';
import * as menuaudios from './plugins/menuaudios.js';
import * as getcommand from './plugins/getcommand.js';
import * as getjid from './plugins/getjid.js';
import * as pin from './plugins/pin.js';
import * as talar from './plugins/talar.js';
import * as cocinar from './plugins/cocinar.js';
import * as comer from './plugins/comer.js';
import * as get from './plugins/get.js';
import * as pescar from './plugins/pescar.js';
import * as claimcode from './plugins/claimcode.js';
import * as anunciostotales from './plugins/anunciostotales.js';
import * as fixps from './plugins/fixps.js';
import * as mateoo from './plugins/mateoo.js';
import * as topaportes from './plugins/topaportes.js';
import * as addvip from './plugins/addvip.js';
import * as checkvip from './plugins/checkvip.js';
import * as dropvip from './plugins/dropvip.js';
import * as superminar from './plugins/superminar.js';
import * as magicbox from './plugins/magicbox.js';
import * as rename from './plugins/rename.js';
import * as fusionarvip from './plugins/fusionarvip.js';
import * as runpzz from './plugins/runpzz.js';
import * as addbot from './plugins/addbot.js';
import * as menuvip from './plugins/menuvip.js';
import * as reporte from './plugins/reporte.js';
import * as sugerencia from './plugins/sugerencia.js';
import * as pregunta from './plugins/pregunta.js';
import * as reply from './plugins/reply.js';
import * as bot from './plugins/bot.js';
import * as makechiste from './plugins/makechiste.js';
import * as chisterandom from './plugins/chisterandom.js';
import * as morse from './plugins/morse.js';
import * as buyvip from './plugins/buyvip.js';
import * as getcommand2 from './getcommand2.js';
import * as aniemoji from './plugins/aniemoji.js';
import * as setlinkpreview from './plugins/setlinkpreview.js';
import * as steal from './plugins/steal.js';
import * as mercado from './plugins/mercado.js';
import * as comprarasientos from './plugins/comprarasientos.js';
import * as aviso from './plugins/aviso.js';
import * as adminabuse from './plugins/adminabuse.js';
import * as newpet from './plugins/newpet.js';
import * as petname from './plugins/petname.js';
import * as invitar from './plugins/invitar.js';
import * as petimg from './plugins/petimg.js';
import * as jugarpet from './plugins/jugarpet.js';
import * as alimentarpet from './plugins/alimentarpet.js';
import * as menupets from './plugins/menupets.js';
import * as mypet from './plugins/mypet.js';
import * as aceptarinvitacion from './plugins/aceptarinvitacion.js';
import * as contacto from './plugins/contacto.js';
import * as imdb from './plugins/imdb.js';
import * as wikipedia from './plugins/wikipedia.js';
import * as addefecto from './plugins/addefecto.js';
import * as setbirthday from './plugins/setbirthday.js';
import * as mybirthday from './plugins/mybirthday.js';
import * as listbirthdays from './plugins/listbirthdays.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';
//import * as claimcode from './plugins/claimcode.js';

const plugins = [ping, registrar, inforegistrar, pareja, enable, disable, menu, configmenu, hidetag, invocar, calcularamor, love, topactivos, gay, simprate, pajero, ship, beso, abrazo, dado, moneda, facherometro, inteligencia, otaku, probaile, luck, adivinabandera, topbanderas, send, warn, unwarn, advertencias, trabajar, aventura, perfil, cazar, promote, demote, groupinfo, viewps, buy, misps, daily, hourly, weekly, monthly, ps, sell, robarps, regalarps, addps, delps, play, musica, banuser, unbanuser, ban, tts, tiktok, instagram, chatgpt, kiss, pfp, styletext, minar, tirar, dailycm, walletcm, atacar, robar, mejorar, ytmp4, nuke, eventocm, regalartiros, megatirar, pokedex, githubsearch, miloj, squidgame, usuarios, doxx, addps2, pay, recolectar, tirar10, tirar20, twitter, topcoins, creditos, cofre, paja, sexo, grupo, mute, unmute, youtube, cat, dog, qr, acortar, tiempo, escanearqr, estado, whereps, tiktoksearch, definir, coronar, mediafire, afk, manuela, secret, enigma, lol, cr7, furry, reiniciar, addps3, npmjs, pornhubdl, ordenarps, añadirps, toppersonajes, checkps, drop, verps, descps, toaudio, tungtungtungsahur, garammaram, tralalerotralala, lavacca, lostralaleritos, lastralaleritas, agarrinilapalini, bonecaambalabu, girafaceleste, grancombinasion, lirililarila, chicleteira, brrbrrpatapim, frulifrula, s, fast, slow, qc, marry, divorcio, aceptar, waifu, hola, ruletarusa, addps4, checkowner, basbas, addowner, delowner, add, penalizar, addpokemonall, mejorarps, apostar, fusionarps, clan, removebg, bloquearpalabra, noafk, xdl, comandos, buscar, bolaocho, ahorcado, topahorcados, regpizzeria, mipizzeria, pzzname, reclamarpzz, viewsv, contratarsv, descontratarsv, missv, pandalogs, reverse, bass, earrape, tupai, nightcore, deep, robot, fat, solicitarespejo, revisarpeticiones, aceptarpeticion, lvlpizzeria, comprarasiento, lvlup, imagenpizzeria, mylid, toppizzerias, lyrics, menupizzeria, menuaudios, getcommand, getjid, pin, talar, cocinar, comer, pescar, get, claimcode, anunciostotales, fixps, mateoo, topaportes, addvip, checkvip, dropvip, superminar, magicbox, rename, fusionarvip, runpzz, addbot, menuvip, reporte, sugerencia, pregunta, reply, bot, makechiste, chisterandom, morse, buyvip, getcommand2, aniemoji, setlinkpreview, mercado, steal, comprarasientos, aviso, adminabuse, newpet, petname, invitar, petimg, jugarpet, alimentarpet, menupets, mypet, aceptarinvitacion, contacto, imdb, wikipedia, addefecto, setbirthday, mybirthday, listbirthdays];

const blockedWordsPath = path.resolve('./data/blockedWords.json');

const afkFile = './data/afk.json';

function normalizeNumber(raw) {
  return raw.split('@')[0].replace(/[^\d+]/g, '');
}

export async function handleMessage(sock, msg) {
  const config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
  const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
  if (!body) return;

  const from = msg.key.remoteJid;

  if (fs.existsSync(blockedWordsPath)) {
    const blockedWords = JSON.parse(fs.readFileSync(blockedWordsPath, 'utf8'));
    if (blockedWords[from] && blockedWords[from].length > 0) {
      const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
      const contiene = blockedWords[from].some(word => texto.toLowerCase().includes(word));
      if (contiene) {
        await sock.sendMessage(from, { delete: msg.key });
        return;
      }
    }
  }

if (msg.key.fromMe) return;

  let afkData = {};
if (fs.existsSync(afkFile)) {
    afkData = JSON.parse(fs.readFileSync(afkFile));
}

if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
    const mentioned = msg.message.extendedTextMessage.contextInfo.mentionedJid;

    for (const mentionedId of mentioned) {
        const cleanId = mentionedId.split('@')[0];
        if (afkData[cleanId]) {
            await sock.sendMessage(from, { delete: msg.key });

            await sock.sendMessage(from, {
                text: `🚫 No molestes al usuario, está AFK: *${afkData[cleanId].reason}*`,
                mentions: [mentionedId]
            });
            break;
        }
    }
}

  const isGroup = from.endsWith('@g.us');
  const senderRaw = msg.key.participant || msg.key.remoteJid;
  const senderNumber = normalizeNumber(senderRaw);
  const db = cargarDatabase();
db.bannedUsers = db.bannedUsers || [];
if (db.bannedUsers.includes(senderRaw)) {
  console.log(`🚫 Usuario baneado: ${senderRaw}`);
  return;
}

const sender = msg.key.participant || msg.key.remoteJid
const user = db.users[sender];

  const isOwner = ownerNumber.includes(`+${senderNumber}`);
const muteadosFile = './data/muteados.json';
if (!fs.existsSync(muteadosFile)) fs.writeFileSync(muteadosFile, '{}');
const muteados = JSON.parse(fs.readFileSync(muteadosFile, 'utf8'));

if (isGroup && muteados[from]?.includes(senderRaw)) {
  console.log(`🔇 Mensaje eliminado por muteo: ${senderRaw}`);
  await sock.sendMessage(from, { delete: msg.key });
  return;
}

  if (user?.birthday) {
    const [day, month] = user.birthday.split('/').map(Number);
    const today = DateTime.now().setZone('America/Santiago');

    if (today.day === day && today.month === month) {
      await sock.sendMessage(msg.key.remoteJid, {
        react: {
          text: '🎉',
          key: msg.key
        }
      });
    }
  }

  const messagesFile = './data/messages.json';
let messagesCount = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));

messagesCount[senderRaw] = (messagesCount[senderRaw] || 0) + 1;

fs.writeFileSync(messagesFile, JSON.stringify(messagesCount, null, 2));

  let groupName = isGroup ? (await sock.groupMetadata(from)).subject : 'Chat Privado';
  let senderName = msg.pushName || senderNumber;
  let isCommand = body.startsWith(prefix);

  if (isCommand) {
    console.log(chalk.gray('=============================='));
    console.log(`🤖 ${chalk.bold.yellow('Comando Recibido:')}`);
    console.log(`- ${chalk.white('Usuario:')} ${chalk.cyan(senderName)}`);
    console.log(`- Número de telefono o LID: +${senderNumber}`);
    console.log(`- ${chalk.white('Grupo:')} ${chalk.green(groupName)}`);
    console.log(`- ${chalk.white('Comando:')} ${chalk.yellow(body)}`);
    console.log(chalk.gray('=============================='));
  } else {
    console.log(chalk.gray('=============================='));
    console.log(`💬 ${chalk.bold.blue('Mensaje de Texto:')}`);
    console.log(`- ${chalk.white('Usuario:')} ${chalk.cyan(senderName)}`);
    console.log(`- ${chalk.white('Grupo:')} ${chalk.green(groupName)}`);
    console.log(`- ${chalk.white('Mensaje:')} ${chalk.white(body)}`);
    console.log(chalk.gray('=============================='));
  }

  config.global = config.global || { modoowner: false, grupos: true, chatsprivados: true, ownerNumber };

  if (config.global.modoowner && !isOwner) {
    return;
  }
  if (isGroup && !config.global.grupos) {
    return;
  }
  if (!isGroup && !config.global.chatsprivados) {
    return; 
  }

    if (isGroup && config.groups?.[from]?.antilink) {
    if (/(https?:\/\/[^\s]+)/i.test(body)) {
      try {
        const metadata = await sock.groupMetadata(from);
        const isAdmin = metadata.participants.some(p =>
          p.id.startsWith(senderNumber) && (p.admin === 'admin' || p.admin === 'superadmin')
        );
        if (!isOwner && !isAdmin) {
          await sock.sendMessage(from, { delete: msg.key });
          await sock.groupParticipantsUpdate(from, [`${senderNumber}@s.whatsapp.net`], 'remove');
          await sock.sendMessage(from, { text: `🚫 Usuario +${senderNumber} eliminado por enviar link.` });
        }
      } catch (e) {
        console.error('❌ Error en antilink:', e);
      }
    }
  }

if (!body.startsWith(prefix)) return;
const args = body.slice(prefix.length).trim().split(/\s+/);
const cmdName = args.shift().toLowerCase();

const plugin = plugins.find(p => p.command === cmdName);
if (plugin) {
try {
await plugin.run(sock, msg, args);
} catch (e) {
console.error('❌ Error ejecutando comando:', e);
}
}
}
