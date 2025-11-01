// gato.js
// Tres en raya (Gato) para Baileys — 1 solo comando con sala por grupo, timer y auto-movimiento.

global.gatoGames = global.gatoGames || {};

const TURN_LIMIT_MS = 60_000; // 60s por turno
const SYMBOL_X = 'X';
const SYMBOL_O = 'O';
const EMOJI = { X: '❌', O: '⭕' };

// -----------------------------
// Utilidades de nombre/grupo
// -----------------------------
function getName(sock, jid) {
  const c = sock?.store?.contacts?.[jid];
  if (c?.name) return c.name;
  if (c?.verifiedName) return c.verifiedName;
  return jid.split('@')[0];
}

async function getGroupName(sock, jid) {
  if (jid.endsWith('@g.us')) {
    try {
      const md = await sock.groupMetadata(jid);
      return md?.subject || getName(sock, jid);
    } catch {}
  }
  return getName(sock, jid);
}

// -----------------------------
// Lógica de tablero
// -----------------------------
function emptyBoard() {
  return Array(9).fill(null); // posiciones 0..8
}

function renderBoard(board) {
  // Muestra [1]..[9] para vacías, y ❌/⭕ para ocupadas
  const cell = (i) => {
    const v = board[i];
    if (v === SYMBOL_X) return `[${EMOJI.X}]`;
    if (v === SYMBOL_O) return `[${EMOJI.O}]`;
    return `[${i + 1}]`;
  };
  return `${cell(0)} ${cell(1)} ${cell(2)}
${cell(3)} ${cell(4)} ${cell(5)}
${cell(6)} ${cell(7)} ${cell(8)}`;
}

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // filas
  [0,3,6],[1,4,7],[2,5,8], // columnas
  [0,4,8],[2,4,6]          // diagonales
];

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // 'X' o 'O'
    }
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

function parsePos(token) {
  const n = parseInt((token || '').trim(), 10);
  if (!Number.isFinite(n)) return -1;
  if (n < 1 || n > 9) return -1;
  return n - 1; // 0..8
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// -----------------------------
// Timers de turno
// -----------------------------
function clearTurnTimer(game) {
  if (game.turnTimer) {
    clearTimeout(game.turnTimer);
    game.turnTimer = null;
  }
}

function startTurnTimer(sock, game) {
  clearTurnTimer(game);
  game.turnTimer = setTimeout(async () => {
    if (game.estado !== 'Jugando') return;
    const player = game.jugadores.find(p => p.jid === game.turnoDe);
    if (!player) return;

    // Auto-movimiento: elige casilla libre al azar
    const libres = game.tablero
      .map((v, i) => v ? null : i)
      .filter(i => i !== null);
    if (libres.length === 0) return;

    const autoIndex = pickRandom(libres);
    const symbol = player.simbolo;
    game.tablero[autoIndex] = symbol;

    await sock.sendMessage(game.chatId, {
      text: `⏰ *Tiempo agotado* de ${player.nombre}. Se jugó automáticamente en la casilla *${autoIndex + 1}*.\n\n${renderBoard(game.tablero)}`
    });

    await afterMove(sock, game, player);
  }, TURN_LIMIT_MS);
}

// -----------------------------
// Flujo post-jugada
// -----------------------------
async function afterMove(sock, game, playerJustMoved) {
  const result = checkWinner(game.tablero);

  if (result === 'draw') {
    game.estado = 'Finalizado';
    clearTurnTimer(game);
    await sock.sendMessage(game.chatId, {
      text: `🤝 *Empate.*\n\n${renderBoard(game.tablero)}\n\n¡Buen juego!`
    });
    delete global.gatoGames[game.chatId];
    return;
  }

  if (result === SYMBOL_X || result === SYMBOL_O) {
    game.estado = 'Finalizado';
    clearTurnTimer(game);
    const winner = game.jugadores.find(p => p.simbolo === result);
    await sock.sendMessage(game.chatId, {
      text: `🏆 *${winner?.nombre || 'Alguien'} ganó* con ${result === 'X' ? EMOJI.X : EMOJI.O}.\n\n${renderBoard(game.tablero)}`
    });
    delete global.gatoGames[game.chatId];
    return;
  }

  // Continuar: pasar turno
  const next = game.jugadores.find(p => p.jid !== playerJustMoved.jid);
  game.turnoDe = next.jid;
  game.turnoTimestamp = Date.now() + TURN_LIMIT_MS;

  await sock.sendMessage(game.chatId, {
    text: `➡️ Turno de *${next.nombre}* (${next.simbolo === 'X' ? EMOJI.X : EMOJI.O}). Tienes ${Math.floor(TURN_LIMIT_MS/1000)}s.\n\n${renderBoard(game.tablero)}`
  });

  // Aviso por DM (estilo Carioca)
  await sock.sendMessage(next.jid, {
    text: `🎮 Tu turno en *${await getGroupName(sock, game.chatId)}*.\nJuega con \`.gato jugar <1-9>\`.\n\n${renderBoard(game.tablero)}`
  });

  startTurnTimer(sock, game);
}

// -----------------------------
// Comando principal
// -----------------------------
export const command = 'gato';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const sub = (args[0] || '').toLowerCase();

  if (from.endsWith('@s.whatsapp.net')) {
    return sock.sendMessage(from, { text: '❌ `.gato` debe usarse *en un grupo*.' });
  }

  const game = global.gatoGames[from];

  // .gato crear
  if (sub === 'crear') {
    if (game && game.estado !== 'Finalizado') {
      return sock.sendMessage(from, { text: '⚠️ Ya hay una partida de Gato activa o en espera en este grupo.' }, { quoted: msg });
    }
    const ownerName = getName(sock, sender);
    global.gatoGames[from] = {
      chatId: from,
      estado: 'Esperando',
      jugadores: [{ jid: sender, nombre: ownerName, simbolo: null, id: 1, esOwner: true }],
      tablero: emptyBoard(),
      turnoDe: null,
      turnoTimestamp: 0,
      turnTimer: null
    };
    return sock.sendMessage(from, {
      text: `🐱 *¡Sala de Gato creada!* \nCreador: *${ownerName}*.\n\nPara unirse: \`.gato join\`\nPara iniciar (necesita 2): \`.gato iniciar\`\nAyuda: \`.gato ayuda\``
    }, { quoted: msg });
  }

  // .gato join
  if (sub === 'join') {
    if (!game || game.estado !== 'Esperando') {
      return sock.sendMessage(from, { text: '❌ No hay una sala en espera. Usa `.gato crear`.' }, { quoted: msg });
    }
    if (game.jugadores.length >= 2) {
      return sock.sendMessage(from, { text: '❌ La sala ya está completa (2 jugadores).' }, { quoted: msg });
    }
    if (game.jugadores.some(p => p.jid === sender)) {
      return sock.sendMessage(from, { text: '⚠️ Ya estás en la sala.' }, { quoted: msg });
    }
    const name = getName(sock, sender);
    game.jugadores.push({ jid: sender, nombre: name, simbolo: null, id: 2, esOwner: false });
    return sock.sendMessage(from, {
      text: `✅ *${name}* se unió. Jugadores: \n*1*: ${game.jugadores[0].nombre}\n*2*: ${name}\n\nEl creador puede iniciar con \`.gato iniciar\`.`
    }, { quoted: msg });
  }

  // .gato iniciar
  if (sub === 'iniciar') {
    if (!game || game.estado !== 'Esperando') {
      return sock.sendMessage(from, { text: '❌ No hay sala lista para iniciar.' }, { quoted: msg });
    }
    if (game.jugadores.length < 2) {
      return sock.sendMessage(from, { text: '❌ Se necesitan 2 jugadores para iniciar.' }, { quoted: msg });
    }
    if (!game.jugadores[0].esOwner || game.jugadores[0].jid !== sender) {
      return sock.sendMessage(from, { text: '❌ Solo el *creador* de la sala puede iniciar.' }, { quoted: msg });
    }

    // Asignar símbolos y primer turno
    const first = Math.random() < 0.5 ? game.jugadores[0] : game.jugadores[1];
    const second = game.jugadores.find(p => p.jid !== first.jid);
    first.simbolo = SYMBOL_X;  // X empieza
    second.simbolo = SYMBOL_O;

    game.estado = 'Jugando';
    game.tablero = emptyBoard();
    game.turnoDe = first.jid;
    game.turnoTimestamp = Date.now() + TURN_LIMIT_MS;

    await sock.sendMessage(from, {
      text: `✅ *Partida iniciada.*\n${first.nombre} es ${EMOJI.X} y ${second.nombre} es ${EMOJI.O}.\n\nEmpieza *${first.nombre}* (${EMOJI.X}).\nJuega con \`.gato jugar <1-9>\`.\n\n${renderBoard(game.tablero)}`
    });

    // Aviso por DM al que inicia
    await sock.sendMessage(first.jid, {
      text: `🎮 Empiezas tú en *${await getGroupName(sock, game.chatId)}*.\nJuega con \`.gato jugar <1-9>\`.\n\n${renderBoard(game.tablero)}`
    });

    startTurnTimer(sock, game);
    return;
  }

  // .gato jugar <pos>
  if (sub === 'jugar') {
    if (!game || game.estado !== 'Jugando') {
      return sock.sendMessage(from, { text: '❌ No hay una partida en curso.' });
    }
    if (game.turnoDe !== sender) {
      return sock.sendMessage(from, { text: `⚠️ No es tu turno, *${getName(sock, sender)}*.` });
    }

    const posToken = args[1];
    const idx = parsePos(posToken);
    if (idx === -1) {
      return sock.sendMessage(from, { text: '❌ Posición inválida. Usa números del *1 al 9*.' });
    }
    if (game.tablero[idx]) {
      return sock.sendMessage(from, { text: '❌ Esa casilla ya está ocupada.' });
    }

    const me = game.jugadores.find(p => p.jid === sender);
    const mySymbol = me.simbolo;
    game.tablero[idx] = mySymbol;

    clearTurnTimer(game); // se reinicia después en afterMove
    await sock.sendMessage(from, {
      text: `🟩 *${me.nombre}* jugó en *${idx + 1}* (${mySymbol === 'X' ? EMOJI.X : EMOJI.O}).\n\n${renderBoard(game.tablero)}`
    });

    await afterMove(sock, game, me);
    return;
  }

  // .gato tablero
  if (sub === 'tablero') {
    if (!game) return sock.sendMessage(from, { text: '❌ No hay sala/partida en este grupo.' });
    let info = renderBoard(game.tablero);
    if (game.estado === 'Jugando') {
      let secs = '';
      if (typeof game.turnoTimestamp === 'number') {
        const s = Math.max(0, Math.ceil((game.turnoTimestamp - Date.now()) / 1000));
        if (s > 0) secs = ` (${s}s restantes)`;
      }
      const turno = game.jugadores.find(p => p.jid === game.turnoDe);
      info += `\n\n⏳ Turno: *${turno?.nombre || '—'}*${secs}`;
    } else if (game.estado === 'Esperando') {
      info += `\n\n⌛ Sala en espera. Usa \`.gato join\` (se necesitan 2) y \`.gato iniciar\`.`;
    }
    return sock.sendMessage(from, { text: info });
  }

  // .gato abandonar
  if (sub === 'abandonar') {
    if (!game) return sock.sendMessage(from, { text: '❌ No hay sala/partida en este grupo.' });
    if (!game.jugadores[0].esOwner || game.jugadores[0].jid !== sender) {
      return sock.sendMessage(from, { text: '❌ Solo el *creador* puede abandonar/finalizar la sala.' });
    }
    clearTurnTimer(game);
    delete global.gatoGames[from];
    return sock.sendMessage(from, { text: '🛑 *Partida/Sala de Gato finalizada.*' });
  }

  // .gato ayuda (y default)
  if (sub === 'ayuda' || !sub) {
    return sock.sendMessage(from, {
      text:
`🐱 *Gato — Tres en raya*
\`.gato crear\` — Crea sala en este grupo
\`.gato join\` — Únete (máx. 2)
\`.gato iniciar\` — Inicia (creador)
\`.gato jugar <1-9>\` — Juega en esa casilla
\`.gato tablero\` — Ver estado actual
\`.gato abandonar\` — Finaliza (creador)

*Reglas:* ❌ empieza. Gana quien alinee 3. Turnos de 60s; si se agota, se juega automático.`
    });
  }

  // subcomando desconocido
  return sock.sendMessage(from, { text: '❌ Subcomando inválido. Usa `.gato ayuda`.' });
}
