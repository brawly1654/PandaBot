// basta.js
// Juego "Basta" (Tutti Frutti) para Baileys — sala única por grupo, menciones, temporizador, evaluación y puntajes.

global.bastaGames = global.bastaGames || {};

// -----------------------------
// Config
// -----------------------------
const TURN_LIMIT_MS = 60_000;          // duración de cada ronda (ms)
const GRACE_AFTER_BASTA_MS = 10_000;   // gracia después de "¡Basta!" (ms)
const DEFAULT_CATEGORIES = ['nombre', 'animal', 'cosa', 'país'];

// Puntuación
const POINT_UNIQUE = 10;
const POINT_DUP = 5;
const POINT_EMPTY = 0;
const BONUS_BASTA = 5;

// Letras (incluye Ñ). Puedes ajustar si quieres excluir letras difíciles.
const ALPHABET = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';

// -----------------------------
// Utils
// -----------------------------
function getName(sock, jid) {
  const c = sock?.store?.contacts?.[jid];
  if (c?.name) return c.name;
  if (c?.verifiedName) return c.verifiedName;
  return jid.split('@')[0];
}
function atOf(jid) { return '@' + jid.split('@')[0]; } // texto @<numero>

// Para mensajes: si es el emisor y trae pushName, úsalo; si no, @<numero>.
function nameOrAtForSender(jid, msg) {
  const senderJid = msg.key.participant || msg.key.remoteJid;
  if (jid === senderJid && msg.pushName) return `*${msg.pushName}*`;
  return atOf(jid);
}

function buildRosterWithMentions(players) {
  const mentions = players.map(p => p.jid);
  const text = players.map(p => `• ${atOf(p.jid)}${p.nombre ? ` (${p.nombre})` : ''}`).join('\n');
  return { text, mentions };
}

function pickRandomLetter() {
  return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
}

// Normaliza: quita acentos, espacios extra y mayusculiza (para comparar)
function norm(s) {
  return (s || '')
    .toString()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .toUpperCase();
}
function firstLetterNorm(s) {
  const n = norm(s);
  return n[0] || '';
}
function startsWithLetter(word, letter) {
  return firstLetterNorm(word) === norm(letter);
}

function clearRoundTimer(game) {
  if (game.roundTimer) clearTimeout(game.roundTimer);
  game.roundTimer = null;
}
function clearGraceTimer(game) {
  if (game.graceTimer) clearTimeout(game.graceTimer);
  game.graceTimer = null;
}

// -----------------------------
// Rondas
// -----------------------------
async function startRound(sock, game) {
  clearRoundTimer(game);
  clearGraceTimer(game);
  game.estado = 'Jugando';
  game.letra = pickRandomLetter();
  game.respuestas = {};       // { jid: { cat: texto } }
  game.bastaCaller = null;    // jid del que dijo basta
  game.turnoTimestamp = Date.now() + TURN_LIMIT_MS;

  const roster = buildRosterWithMentions(game.jugadores);

  game.roundTimer = setTimeout(async () => {
    await endRound(sock, game, '⏰ Tiempo agotado');
  }, TURN_LIMIT_MS);

  await sock.sendMessage(game.chatId, {
    text:
`🎯 *¡Nueva ronda de Basta!*
Letra: *${game.letra}*
Categorías: ${game.categories.join(', ')}
Tienen ${Math.floor(TURN_LIMIT_MS/1000)}s para responder.

Usen: \`.basta palabra <categoría> <texto>\`  (ej. \`.basta palabra país Perú\`)
Digan \`.basta basta\` para cortar la ronda (tiene ${Math.floor(GRACE_AFTER_BASTA_MS/1000)}s de gracia).`,
    mentions: roster.mentions
  });
}

async function endRound(sock, game, motivo = '') {
  clearRoundTimer(game);
  clearGraceTimer(game);
  if (game.estado !== 'Jugando' && game.estado !== 'Evaluando') return;
  game.estado = 'Evaluando';

  // Construir tabla de respuestas
  let resumen = `📋 *Ronda terminada* ${motivo ? `(${motivo})` : ''}\nLetra: *${game.letra}*\n\n`;

  // Evaluación: por categoría, detectar duplicados (acento-insensible)
  // 1) recolectar valores válidos por cat
  const cats = game.categories;
  const valuesByCat = {}; // cat -> [{jid, text, norm}]
  for (const cat of cats) {
    valuesByCat[cat] = [];
    for (const j of game.jugadores) {
      const r = game.respuestas[j.jid]?.[cat];
      if (r && startsWithLetter(r, game.letra)) {
        valuesByCat[cat].push({ jid: j.jid, text: r, norm: norm(r) });
      }
    }
  }
  // 2) calcular duplicados por cat
  const dupByCat = {}; // cat -> Set(norm) que están repetidos
  for (const cat of cats) {
    const freq = new Map();
    for (const it of valuesByCat[cat]) {
      freq.set(it.norm, (freq.get(it.norm) || 0) + 1);
    }
    dupByCat[cat] = new Set([...freq.entries()].filter(([, c]) => c > 1).map(([k]) => k));
  }

  // 3) puntuar
  const roundPoints = {}; // jid -> puntos en la ronda
  const detailByPlayer = {}; // jid -> { cat: {text, pts} }
  for (const pj of game.jugadores) {
    roundPoints[pj.jid] = 0;
    detailByPlayer[pj.jid] = {};
    for (const cat of cats) {
      const raw = game.respuestas[pj.jid]?.[cat];
      let pts = POINT_EMPTY;
      if (raw && startsWithLetter(raw, game.letra)) {
        const n = norm(raw);
        pts = dupByCat[cat].has(n) ? POINT_DUP : POINT_UNIQUE;
      }
      detailByPlayer[pj.jid][cat] = { text: raw || '—', pts };
      roundPoints[pj.jid] += pts;
    }
  }

  // Bonus BASTA
  if (game.bastaCaller) {
    roundPoints[game.bastaCaller] = (roundPoints[game.bastaCaller] || 0) + BONUS_BASTA;
  }

  // 4) sumar a acumulado y armar resumen por jugador
  for (const j of game.jugadores) {
    j.puntos += roundPoints[j.jid] || 0;

    resumen += `*${atOf(j.jid)}*  (+${roundPoints[j.jid] || 0} | total: ${j.puntos})\n`;
    for (const cat of cats) {
      const { text, pts } = detailByPlayer[j.jid][cat];
      resumen += `  • ${cat}: ${text}  —  *${pts}* pts\n`;
    }
    if (game.bastaCaller === j.jid) resumen += `  • BONUS BASTA: +${BONUS_BASTA}\n`;
    resumen += '\n';
  }

  const mentionsAll = game.jugadores.map(p => p.jid);
  await sock.sendMessage(game.chatId, { text: resumen.trim(), mentions: mentionsAll });

  // Reinicio a siguiente ronda
  game.estado = 'EsperandoRonda';
  await sock.sendMessage(game.chatId, {
    text: '⌛ Escribe `.basta siguiente` para la próxima ronda o `.basta finalizar` para terminar.',
    mentions: mentionsAll
  });
}

// -----------------------------
// Comando principal
// -----------------------------
export const command = 'basta';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const sub = (args[0] || '').toLowerCase();

  if (from.endsWith('@s.whatsapp.net'))
    return sock.sendMessage(from, { text: '❌ `.basta` solo puede usarse en *grupos*.' });

  let game = global.bastaGames[from];

  // .basta crear
  if (sub === 'crear') {
    if (game && game.estado !== 'Finalizado')
      return sock.sendMessage(from, { text: '⚠️ Ya hay una sala activa en este grupo.' });

    const ownerName = getName(sock, sender);
    game = global.bastaGames[from] = {
      chatId: from,
      estado: 'Esperando',
      jugadores: [{ jid: sender, nombre: ownerName, puntos: 0, esOwner: true }],
      categories: [...DEFAULT_CATEGORIES],
      letra: null,
      respuestas: {},
      bastaCaller: null,
      roundTimer: null,
      graceTimer: null,
      turnoTimestamp: 0
    };

    return sock.sendMessage(from, {
      text:
`🧩 *Sala de Basta creada* por ${atOf(sender)}.
Únete con \`.basta join\`.
Cuando haya 2+, el creador puede usar \`.basta iniciar\`.

*Categorías actuales:* ${game.categories.join(', ')}
(El creador puede cambiarlas con: \`.basta categorias nombre,animal,...\`)`,
      mentions: [sender]
    });
  }

  // .basta categorias <lista>  (solo en Esperando y dueño)
  if (sub === 'categorias') {
    if (!game || game.estado !== 'Esperando')
      return sock.sendMessage(from, { text: '❌ Solo puedes cambiar categorías *antes* de iniciar.' });

    const owner = game.jugadores.find(p => p.esOwner);
    if (!owner || owner.jid !== sender)
      return sock.sendMessage(from, { text: '❌ Solo el *creador* puede cambiar categorías.' });

    const raw = args.slice(1).join(' ');
    const list = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (list.length < 2) return sock.sendMessage(from, { text: '❌ Define al menos 2 categorías, separadas por coma.' });

    game.categories = list;
    return sock.sendMessage(from, { text: `✅ *Categorías actualizadas:* ${game.categories.join(', ')}` });
  }

  // .basta join
  if (sub === 'join') {
    if (!game || game.estado !== 'Esperando')
      return sock.sendMessage(from, { text: '❌ No hay sala en espera.' });

    if (game.jugadores.some(p => p.jid === sender))
      return sock.sendMessage(from, { text: '⚠️ Ya estás en la sala.' });

    const name = getName(sock, sender);
    game.jugadores.push({ jid: sender, nombre: name, puntos: 0, esOwner: false });

    const roster = buildRosterWithMentions(game.jugadores);
    return sock.sendMessage(from, {
      text: `✅ ${atOf(sender)} se unió.\n\n*Jugadores (${game.jugadores.length}):*\n${roster.text}`,
      mentions: roster.mentions
    });
  }

  // .basta iniciar
  if (sub === 'iniciar') {
    if (!game || game.estado !== 'Esperando')
      return sock.sendMessage(from, { text: '❌ No hay sala lista para iniciar.' });

    const owner = game.jugadores.find(p => p.esOwner);
    if (!owner || owner.jid !== sender)
      return sock.sendMessage(from, { text: '❌ Solo el *creador* puede iniciar.' });

    if (game.jugadores.length < 2)
      return sock.sendMessage(from, { text: '❌ Se necesitan *al menos 2* jugadores.' });

    await startRound(sock, game);
    return;
  }

  // .basta palabra <categoria> <texto>
  if (sub === 'palabra') {
    if (!game || game.estado !== 'Jugando')
      return sock.sendMessage(from, { text: '❌ No hay ronda activa.' });

    const categoria = (args[1] || '').toLowerCase();
    const texto = args.slice(2).join(' ').trim();

    if (!game.categories.includes(categoria))
      return sock.sendMessage(from, { text: `❌ Categoría inválida. Usa: ${game.categories.join(', ')}` });

    if (!texto) return sock.sendMessage(from, { text: '❌ Falta la palabra.' });
    if (!startsWithLetter(texto, game.letra))
      return sock.sendMessage(from, { text: `⚠️ La palabra debe empezar con *${game.letra}*.` });

    game.respuestas[sender] = game.respuestas[sender] || {};
    game.respuestas[sender][categoria] = texto;

    return sock.sendMessage(from, {
      text: `📝 ${nameOrAtForSender(sender, msg)} respondió en *${categoria}*: _${texto}_`,
      mentions: [sender]
    });
  }

  // .basta basta
  if (sub === 'basta') {
    if (!game || game.estado !== 'Jugando')
      return sock.sendMessage(from, { text: '❌ No hay ronda activa.' });

    // Si ya había gracia corriendo, evita duplicarla
    if (game.graceTimer) {
      return sock.sendMessage(from, { text: '⏳ Ya hay un *¡Basta!* en curso. Aprovecha la gracia para completar.' });
    }

    game.bastaCaller = sender;

    // Anuncia y otorga gracia
    await sock.sendMessage(from, {
      text: `✋ ${nameOrAtForSender(sender, msg)} dijo *¡BASTA!* — Tienen ${Math.floor(GRACE_AFTER_BASTA_MS/1000)}s de gracia.`,
      mentions: [sender]
    });

    clearRoundTimer(game);
    game.graceTimer = setTimeout(async () => {
      await endRound(sock, game, `✋ ${atOf(sender)} dijo ¡BASTA!`);
    }, GRACE_AFTER_BASTA_MS);
    return;
  }

  // .basta estado
  if (sub === 'estado') {
    if (!game) return sock.sendMessage(from, { text: '❌ No hay sala activa.' });

    let fase = game.estado;
    if (fase === 'Jugando') {
      const msLeft = Math.max(0, (game.roundTimer ? game.turnoTimestamp - Date.now() : 0));
      fase = `Jugando — quedan ~${Math.ceil(msLeft/1000)}s`;
      if (game.graceTimer) fase += ` (gracia activa: ${Math.ceil(GRACE_AFTER_BASTA_MS/1000)}s)`;
    }

    const cats = game.categories;
    let lines = '';
    const mentions = [];
    for (const j of game.jugadores) {
      mentions.push(j.jid);
      lines += `\n*${atOf(j.jid)}*:\n`;
      const r = game.respuestas[j.jid] || {};
      for (const c of cats) {
        const v = r[c] ? '_' + r[c] + '_' : '—';
        lines += `  • ${c}: ${v}\n`;
      }
    }

    return sock.sendMessage(from, {
      text:
`📊 *Estado de la ronda*
Fase: ${fase}
Letra: *${game.letra || '—'}*
Categorías: ${game.categories.join(', ')}
${lines}`,
      mentions
    });
  }

  // .basta siguiente
  if (sub === 'siguiente') {
    if (!game || game.estado !== 'EsperandoRonda')
      return sock.sendMessage(from, { text: '❌ No hay ronda en espera.' });
    return startRound(sock, game);
  }

  // .basta finalizar
  if (sub === 'finalizar') {
    if (!game) return sock.sendMessage(from, { text: '❌ No hay sala activa.' });
    const owner = game.jugadores.find(p => p.esOwner);
    if (!owner || owner.jid !== sender)
      return sock.sendMessage(from, { text: '❌ Solo el *creador* puede finalizar.' });

    clearRoundTimer(game);
    clearGraceTimer(game);

    // Tabla final
    const ranking = [...game.jugadores].sort((a, b) => b.puntos - a.puntos);
    const mentions = ranking.map(p => p.jid);
    const tabla = ranking.map((p, i) => `${i + 1}. ${atOf(p.jid)} — *${p.puntos}* pts${p.nombre ? ` (${p.nombre})` : ''}`).join('\n');

    await sock.sendMessage(from, {
      text: `🏁 *Juego de Basta finalizado.*\n\n*Marcador final:*\n${tabla}`,
      mentions
    });

    delete global.bastaGames[from];
    return;
  }

  // Ayuda / default
  const cats = game?.categories || DEFAULT_CATEGORIES;
  return sock.sendMessage(from, {
    text:
`✋ *Basta — Tutti Frutti*
\`.basta crear\` — Crea sala
\`.basta join\` — Únete
\`.basta categorias nombre,animal,...\` — Cambia categorías (antes de iniciar)
\`.basta iniciar\` — Inicia el juego
\`.basta palabra <cat> <texto>\` — Responde (la palabra debe iniciar con la letra)
\`.basta basta\` — Corta la ronda (da ${Math.floor(GRACE_AFTER_BASTA_MS/1000)}s de gracia y +${BONUS_BASTA} pts)
\`.basta estado\` — Ver progreso y tiempo
\`.basta siguiente\` — Nueva ronda
\`.basta finalizar\` — Terminar juego (creador)

*Categorías:* ${cats.join(', ')}
Puntuación: única válida = ${POINT_UNIQUE}, repetida = ${POINT_DUP}, vacía = ${POINT_EMPTY}, bonus ¡Basta! = +${BONUS_BASTA}.
Tiempo por ronda: ${Math.floor(TURN_LIMIT_MS/1000)}s.`
  });
}
