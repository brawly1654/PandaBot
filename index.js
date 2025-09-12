import fs from 'fs';
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import { handleMessage } from './handler.js';
import readline from 'readline';
import chalk from 'chalk';
import NodeCache from 'node-cache';
import pino from 'pino';

// --- CÓDIGO CORREGIDO ---
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  jidNormalizedUser,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
// --- FIN DEL CÓDIGO CORREGIDO ---

global.cmDB = JSON.parse(fs.readFileSync('./coinmaster.json'));
global.guardarCM = () => fs.writeFileSync('./coinmaster.json', JSON.stringify(global.cmDB, null, 2));
global.recolectarCooldown = {};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver));

const msgRetryCounterCache = new NodeCache();
const sessions = 'auth_info';
const nameqr = 'PandaBot';
const methodCodeQR = process.argv.includes("qr");
const methodCode = process.argv.includes("code");

async function startBot() {
  const { version } = await fetchLatestBaileysVersion();
  const { state, saveCreds } = await useMultiFileAuthState(sessions);
  const auth = {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' })),
  };

  let connectionMethod = 'qr';
  if (methodCode) {
    connectionMethod = 'code';
  } else if (!fs.existsSync(`./${sessions}/creds.json`)) {
    console.log(chalk.bold.magentaBright(`\n⌨ Selecciona una opción:`));
    console.log(chalk.bold.greenBright(`1. Con código QR`));
    console.log(chalk.bold.cyanBright(`2. Con código de texto de 8 dígitos`));
    const choice = await question(chalk.bold.yellowBright(`--> `));
    connectionMethod = choice === '2' ? 'code' : 'qr';
  }

  const sock = makeWASocket({
    version,
    auth,
    printQRInTerminal: connectionMethod === 'qr',
    browser: connectionMethod === 'qr' ? [nameqr, 'Chrome', '20.0.04'] : ['Ubuntu', 'Edge', '110.0.1587.56'],
    msgRetryCounterCache,
    getMessage: async (clave) => {
        let jid = jidNormalizedUser(clave.remoteJid);
        let msg = await store.loadMessage(jid, clave.id); // Asume que store está definido si lo necesitas
        return msg?.message || "";
    },
  });

  if (connectionMethod === 'code' && !sock.authState.creds.registered) {
    const phoneNumber = await question(chalk.bold.magentaBright(`\nIngresa tu número (ej: 56912345678)\n--> `));
    if (phoneNumber) {
      const code = await sock.requestPairingCode(phoneNumber.replace(/\D/g, ''));
      console.log(chalk.bold.white(chalk.bgMagenta(`✞ CÓDIGO DE VINCULACIÓN ✞`)), chalk.bold.white(chalk.white(code)));
    } else {
      console.log(chalk.bold.redBright(`❌ Número de teléfono inválido.`));
      rl.close();
      return;
    }
  }

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('group-participants.update', async (update) => {
    const { id, participants, action, author } = update;
    let texto = '';

    if (action === 'add') {
      texto = `👋 Bienvenido @${participants[0].split('@')[0]} al grupo!`;
    } else if (action === 'remove') {
      texto = `👋 Adiós @${participants[0].split('@')[0]}, te vamos a extrañar.`;
    } else if (action === 'promote') {
      texto = `🎉 @${participants[0].split('@')[0]} ahora es *admin* del grupo.`;
    } else if (action === 'demote') {
      texto = `⚠️ @${participants[0].split('@')[0]} ha sido *removido como admin*.`;
    }

    if (texto) {
      await sock.sendMessage(id, { text: texto, mentions: participants });
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message) continue;
      try {
        await handleMessage(sock, msg);
      } catch (e) {
        console.error('❌ Error en handleMessage:', e);
      }
    }
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && connectionMethod === 'qr') {
      console.log('📱 Escanea este QR para vincular el bot:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('⚠️ Conexión cerrada, reconectando:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('❌ Bot deslogueado, borra auth_info y vuelve a iniciar.');
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado correctamente!');
    }
  });
}

startBot();

