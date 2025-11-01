
global.cariocaGames = global.cariocaGames || {};

export const GAME_TIME_LIMIT_MS = 60_000; // 60s por turno

// Orden por valor y por pinta (usado para ordenar la mano visualmente)
export const VALUE_ORDER = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
export const SUIT_ORDER = ['♣️', '♦️', '♥️', '♠️', '★'];

// Mapas para normalizar pintas desde texto
const SUIT_ALIAS_TO_EMOJI = {
  'C': '♣️', '♣': '♣️', '♣️': '♣️',
  'D': '♦️', '♦': '♦️', '♦️': '♦️',
  'H': '♥️', '♥': '♥️', '♥️': '♥️',
  'S': '♠️', '♠': '♠️', '♠️': '♠️',
  '*': '★',  '★': '★'
};

// -----------------------------
// Utilidades de nombre/etiquetas
// -----------------------------

export function getName(sock, jid) {
  // Mejor esfuerzo sincrónico (contactos en cache si usas store)
  const c = sock?.store?.contacts?.[jid];
  if (c?.name) return c.name;
  if (c?.verifiedName) return c.verifiedName;
  // Fallback: número
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
// Cartas
// -----------------------------

export function sortHand(hand) {
  return hand.slice().sort((a, b) => {
    const va = a.v === 'JOKER' ? 14 : VALUE_ORDER.indexOf(a.v);
    const vb = b.v === 'JOKER' ? 14 : VALUE_ORDER.indexOf(b.v);
    if (va !== vb) return va - vb;
    return SUIT_ORDER.indexOf(a.p) - SUIT_ORDER.indexOf(b.p);
  });
}

export function formatHand(hand) {
  return sortHand(hand).map(c => `[${c.v}${c.p}]`).join(' ');
}

export function formatCard(c) {
  return `[${c.v}${c.p}]`;
}

// Acepta: "5C", "5♣", "5♣️", "10D", "QH", "K♠️", "JOKER", "JOKER★"
export function parseCardInput(raw) {
  let t = (raw || '').toString().trim().toUpperCase().replace(/\s+/g, '');
  if (!t) return null;

  // Joker flexible
  if (t === 'JOKER' || t === 'JOKER★' || t === 'JK' || t === 'J*') {
    return { v: 'JOKER', p: '★' };
  }

  // Detectar pinta (emoji o letra final C/D/H/S/*)
  let suitToken = null;

  // Busca emoji de pinta
  const emojiMatch = t.match(/[♣♦♥♠★]/u);
  if (emojiMatch) {
    suitToken = emojiMatch[0];
  } else {
    const tailLetter = t.match(/(10|[2-9]|[JQKA])?(C|D|H|S|\*)$/);
    if (tailLetter) suitToken = tailLetter[2];
  }

  if (!suitToken) return null;
  const p = SUIT_ALIAS_TO_EMOJI[suitToken] || null;
  if (!p) return null;

  // Valor = resto sin la pinta
  const vPart = t.replace(/[♣♦♥♠★]/u, '').replace(/(C|D|H|S|\*)$/, '');
  if (!vPart) return null;

  const normalized = vPart === '1' ? 'A'
                     : (vPart === '11' ? 'J'
                        : (vPart === '12' ? 'Q'
                           : (vPart === '13' ? 'K' : vPart)));

  const ok = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'].includes(normalized);
  if (!ok) return null;

  return { v: normalized, p };
}

// -----------------------------
// Mazo
// -----------------------------

export function generateDeck() {
  const palos = ['♣️', '♦️', '♥️', '♠️'];
  const valores = VALUE_ORDER;
  const deck = [];
  // 2 barajas estándar
  for (let i = 0; i < 2; i++) {
    for (const palo of palos) for (const valor of valores) deck.push({ p: palo, v: valor });
  }
  // 4 Jokers
  for (let i = 0; i < 4; i++) deck.push({ p: '★', v: 'JOKER' });
  // Mezcla Fisher-Yates (mejor que sort aleatorio)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function drawFromMazo(game) {
  if (!game.mazo || game.mazo.length === 0) {
    // Reponer mazo si se agotó
    game.mazo = generateDeck();
  }
  return game.mazo.pop();
}

// -----------------------------
// Turnos
// -----------------------------

export function pickRandom(list) {
  const i = Math.floor(list.length * Math.random());
  return list[i].jid;
}

export function nextTurn(game) {
  const currentIndex = game.jugadores.findIndex(p => p.jid === game.turnoDe);
  const nextIndex = (currentIndex + 1) % game.jugadores.length;
  game.turnoDe = game.jugadores[nextIndex].jid;
  game.turnoTimestamp = Date.now() + GAME_TIME_LIMIT_MS;
  game.estadoTurno = 'Robar';
  return game.turnoDe;
}

function clearTurnTimer(game) {
  if (game.turnTimer) {
    clearTimeout(game.turnTimer);
    game.turnTimer = null;
  }
}

function startTurnTimer(sock, game) {
  clearTurnTimer(game);
  game.turnTimer = setTimeout(async () => {
    // Auto-acción al expirar: roba (si no robó) y descarta aleatorio, pasa turno
    const player = game.jugadores.find(p => p.jid === game.turnoDe);
    if (!player || game.estado !== 'Jugando') return;

    if (game.estadoTurno === 'Robar') {
      const c = drawFromMazo(game);
      player.mano.push(c);
    }
    // Descartar aleatorio
    const idx = Math.floor(Math.random() * player.mano.length);
    const discarded = player.mano.splice(idx, 1)[0];
    game.pozo = discarded;

    const prev = getName(sock, player.jid);
    const nextJid = nextTurn(game);

    await sock.sendMessage(game.chatId, {
      text: `⏰ *Tiempo agotado* de ${prev}. Se descartó ${formatCard(discarded)} automáticamente.\n➡️ Turno de *${getName(sock, nextJid)}*.`
    });

    await notifyTurn(sock, game, nextJid);
  }, GAME_TIME_LIMIT_MS);
}

export async function notifyTurn(sock, game, nextPlayerJid) {
  const groupName = await getGroupName(sock, game.chatId);
  const playerName = getName(sock, nextPlayerJid);

  await sock.sendMessage(game.chatId, {
    text: `🔔 ¡Es el turno de *${playerName}*! Tienes ${Math.floor(GAME_TIME_LIMIT_MS / 1000)} segundos.\nUsa \`.jugada recoger mazo\` o \`.jugada recoger pozo\` *AQUÍ en el grupo*.`
  });

  await new Promise(r => setTimeout(r, 1200));
  const player = game.jugadores.find(p => p.jid === nextPlayerJid);
  const manoStr = formatHand(player.mano);

  await sock.sendMessage(nextPlayerJid, {
    text: `¡Tu turno en *${groupName}*!\nRonda ${game.rondaActual}: ${game.contrato}\n\n*TU MANO:*\n${manoStr}\n\n*OPCIONES (USAR EN EL GRUPO):*\n\`.jugada recoger mazo\`\n\`.jugada recoger pozo\``
  });

  startTurnTimer(sock, game);
}

// -----------------------------
// Contratos (añadí "req" para validar composición básica)
// -----------------------------

export const CONTRATOS = [
  { ronda: 1,  nombre: "2 Tríos",                      minCartas: 6,  req: { trio: 2, escala: 0 } },
  { ronda: 2,  nombre: "1 Trío + 1 Escala",            minCartas: 7,  req: { trio: 1, escala: 1 } },
  { ronda: 3,  nombre: "2 Escalas",                    minCartas: 8,  req: { trio: 0, escala: 2 } },
  { ronda: 4,  nombre: "3 Tríos",                      minCartas: 9,  req: { trio: 3, escala: 0 } },
  { ronda: 5,  nombre: "2 Tríos + 1 Escala",           minCartas: 10, req: { trio: 2, escala: 1 } },
  { ronda: 6,  nombre: "1 Trío + 2 Escalas",           minCartas: 11, req: { trio: 1, escala: 2 } },
  { ronda: 7,  nombre: "3 Escalas",                    minCartas: 12, req: { trio: 0, escala: 3 } },
  { ronda: 8,  nombre: "4 Tríos",                      minCartas: 12, req: { trio: 4, escala: 0 } },
  // Para 9 y 10 validaremos por cantidad (13). Puedes endurecer reglas en jugada.js si quieres.
  { ronda: 9,  nombre: "Escalera Sucia (A-K)",         minCartas: 13, req: null },
  { ronda: 10, nombre: "Escalera Real (A-K, misma pinta)", minCartas: 13, req: null }
];

// -----------------------------
// Comando principal .carioca
// -----------------------------

export const command = 'carioca';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const subCommand = (args[0] || '').toLowerCase();
  const game = global.cariocaGames[from];

  if (from.endsWith('@s.whatsapp.net')) {
    return sock.sendMessage(from, { text: '❌ El comando `.carioca` debe usarse *en un grupo*.' });
  }

  if (subCommand === 'crear') {
    if (game && game.estado !== 'Finalizado') {
      return sock.sendMessage(from, { text: '⚠️ Ya hay una partida activa o en espera en este grupo.' }, { quoted: msg });
    }
    const senderName = getName(sock, sender);
    global.cariocaGames[from] = {
      chatId: from,
      estado: 'Esperando',
      rondaActual: 1,
      contrato: CONTRATOS[0].nombre,
      mazo: [],
      pozo: null,            // tope del pozo
      turnoDe: null,
      turnoTimestamp: 0,
      estadoTurno: 'Robar',  // Robar | Botar
      turnTimer: null,
      jugadores: [{ jid: sender, mano: [], puntaje: 0, haBajado: false, juegosBajados: [], nombre: senderName, id: 1 }]
    };

    return sock.sendMessage(from, {
      text: `🃏 *¡Partida de Carioca creada!* 🃏\n\nLíder: *${senderName}*.\n\nPara unirse: \`.carioca join\`.\nPara empezar (Mín. 2, Máx. 4): \`.carioca iniciar\`.\n\n*Ayuda:* \`.carioca reglas\` | \`.carioca cartasactuales\``
    }, { quoted: msg });
  }

  if (subCommand === 'join') {
    if (!game || game.estado !== 'Esperando') {
      return sock.sendMessage(from, { text: '❌ No hay una partida en espera. Usa `.carioca crear`.' }, { quoted: msg });
    }
    if (game.jugadores.length >= 4) {
      return sock.sendMessage(from, { text: '❌ La partida ya está llena (4 jugadores).' }, { quoted: msg });
    }
    if (game.jugadores.some(p => p.jid === sender)) {
      return sock.sendMessage(from, { text: '⚠️ Ya estás unido a la partida.' }, { quoted: msg });
    }

    const senderName = getName(sock, sender);
    const newId = game.jugadores.length + 1;
    game.jugadores.push({ jid: sender, mano: [], puntaje: 0, haBajado: false, juegosBajados: [], nombre: senderName, id: newId });

    const lista = game.jugadores.map((p) => `*ID ${p.id}*: ${p.nombre}`).join('\n');
    return sock.sendMessage(from, { text: `✅ *${senderName}* se ha unido. Jugadores (${game.jugadores.length}/4):\n${lista}` }, { quoted: msg });
  }

  if (subCommand === 'iniciar') {
    if (!game || game.estado !== 'Esperando') {
      return sock.sendMessage(from, { text: '❌ No hay una partida en espera para empezar.' }, { quoted: msg });
    }
    if (game.jugadores.length < 2) {
      return sock.sendMessage(from, { text: '❌ Se necesitan al menos 2 jugadores.' }, { quoted: msg });
    }
    if (game.jugadores[0].jid !== sender) {
      return sock.sendMessage(from, { text: '❌ Solo el *creador* de la partida puede iniciarla.' }, { quoted: msg });
    }

    game.estado = 'Jugando';
    game.mazo = generateDeck();
    game.turnoDe = pickRandom(game.jugadores);
    game.contrato = CONTRATOS[0].nombre;

    // Reparto 12 cartas en R1..R8 (R9..R10 ya se ajustan en endRound)
    for (const player of game.jugadores) {
      for (let i = 0; i < 12; i++) {
        player.mano.push(drawFromMazo(game));
      }
    }

    // Primera carta al pozo (visible)
    game.pozo = drawFromMazo(game);

    const jugadores = game.jugadores.map(p => `*ID ${p.id}*: ${p.nombre}`).join('\n');
    await sock.sendMessage(from, {
      text: `✅ *¡Partida Iniciada!* Jugadores:\n${jugadores}\n\n*Ronda 1: ${game.contrato}*\n\n🎲 Turno de *${getName(sock, game.turnoDe)}*.\n_Todas las jugadas se hacen en este grupo._`
    }, { quoted: msg });

    await notifyTurn(sock, game, game.turnoDe);
    return;
  }

  if (subCommand === 'abandonar') {
    if (!game) {
      return sock.sendMessage(from, { text: '❌ No hay partida de Carioca activa o en espera en este grupo.' }, { quoted: msg });
    }
    if (game.jugadores[0].jid !== sender) {
      return sock.sendMessage(from, { text: '❌ Solo el *creador* (quien hizo `.carioca crear`) puede usar `.carioca abandonar`.' }, { quoted: msg });
    }
    clearTurnTimer(game);
    delete global.cariocaGames[from];
    return sock.sendMessage(from, { text: `🛑 *Partida ABANDONADA y FINALIZADA.* Puedes crear otra con \`.carioca crear\`.` }, { quoted: msg });
  }

  // Extras útiles que ya anunciabas en el help:
  if (subCommand === 'cartasactuales') {
    if (!game || game.estado !== 'Jugando') return sock.sendMessage(from, { text: '❌ No hay partida en curso.' });
    const pj = game.jugadores.find(j => j.jid === (msg.key.participant || msg.key.remoteJid));
    if (!pj) return sock.sendMessage(from, { text: '❌ No estás en la partida.' });
    return sock.sendMessage(pj.jid, { text: `*Tus cartas (Ronda ${game.rondaActual}):*\n${formatHand(pj.mano)}` });
  }

  if (subCommand === 'reglas' || subCommand === 'reglascarioca') {
    const reglas = CONTRATOS.map(c => `Ronda ${c.ronda}: ${c.nombre} (mín. ${c.minCartas})`).join('\n');
    return sock.sendMessage(from, { text: `📜 *Contratos de la partida:*\n${reglas}\n\nUso:\n\`.carioca crear | join | iniciar | abandonar | cartasactuales | reglas\`` });
  }

  return sock.sendMessage(from, {
    text: 'Comandos:\n`.carioca crear`\n`.carioca join`\n`.carioca iniciar`\n`.carioca abandonar`\n`.carioca cartasactuales`\n`.carioca reglas`'
  }, { quoted: msg });
}
