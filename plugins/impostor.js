// impostor.js
// Juego "Impostor de Palabras" para Baileys.
// Sala por grupo (3–8). Rondas: una palabra por jugador (grupo) y luego votación *en el grupo*.
// Extras: Palabra prohibida (decir el animal exacto te elimina) y Segunda Vuelta si hay empate.
// Menciones: se muestran @<numero> y se envían 'mentions' para etiquetar a usuarios.
// Votación: acepta `.impostor votar <ID>` o `.impostor votar @usuario`.

global.impostorGames = global.impostorGames || {};

const ROUND_TIME_MS  = 90_000;  // 90s para palabras
const VOTE_TIME_MS   = 60_000;  // 60s para votar (primera vuelta)
const RUNOFF_TIME_MS = 45_000;  // 45s para segunda vuelta

const ANIMALS = [
  'PERRO','GATO','LEON','TIGRE','ELEFANTE','JIRAFA','ZORRO','OSO','LOBO','CEBRA',
  'COCODRILO','HIPOPOTAMO','RINOCERONTE','PINGUINO','KOALA','CANGURO','AGUILA',
  'HALCON','BUHO','DELFIN','BALLENA','FOCA','NUTRIA','CABALLO','BURRO','CERDO',
  'OVEJA','CABRA','GALLINA','PAVO','RATON','ARDILLA','MAPACHE','PANDA','GORILA',
  'MONO','IGUANA','SERPIENTE','RANA','TORTUGA', 'INDONESIA', 'MEXICO', 'CHILE',
  'JAPÓN', 'PERÚ', 'BRASIL', 'COLOMBIA', 'CAMERÚN', 'AUSTRIA', 'FRANCIA', 'PANDABOT',
  'REGGAETON', 'ARGENTINA', 'ESPAÑA',
  'TRALALERO', 'CHINA', 'ALEMANIA', 'ITALIA',
  'AFRICA', 'CHAD', 'COREA', 'TOMAS',
  'ROBERTO', 'PACO', 'FANTASMA', 'AUTISMO'
];

// -----------------------------
// Utilidades
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
function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clearPhaseTimer(game) { if (game.phaseTimer) { clearTimeout(game.phaseTimer); game.phaseTimer = null; } }
function alivePlayers(game) { return game.jugadores.filter(j => j.alive); }
function atOf(jid) { return '@' + jid.split('@')[0]; } // texto @<numero>
function rosterLineAt(p) { return `*ID ${p.id}* — ${atOf(p.jid)} ${p.nombre ? `(${p.nombre})` : ''}${p.alive ? '' : ' (⛔️ eliminado)'}`; }
function sanitizeWord(w) { const t = (w || '').trim(); if (!t) return ''; return t.replace(/\s+/g, ' ').slice(0, 24); }
// Normaliza para comparar strings (quita acentos/espacios y a MAYÚS)
function norm(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
}
// Nombre/mencción del emisor: si es quien envía y trae pushName, usamos pushName; si no, @<numero>
function nameOrAtForSender(jid, msg) {
  const senderJid = msg.key.participant || msg.key.remoteJid;
  if (jid === senderJid && msg.pushName) return `*${msg.pushName}*`;
  return atOf(jid);
}
function nameOrAt(jid) { return atOf(jid); }

// Extrae todas las menciones reales del mensaje (cubre distintos tipos)
function getMentionedJids(msg) {
  const m = msg?.message || {};
  const out = new Set();
  for (const v of Object.values(m)) {
    const mj = v?.contextInfo?.mentionedJid;
    if (Array.isArray(mj)) for (const x of mj) out.add(x);
    const cap = v?.caption?.contextInfo?.mentionedJid;
    if (Array.isArray(cap)) for (const x of cap) out.add(x);
  }
  return [...out];
}

// Construye lista con @ y devuelve texto + mentions[]
function buildRosterWithMentions(players) {
  const mentions = players.map(p => p.jid);
  const text = players.map(rosterLineAt).join('\n');
  return { text, mentions };
}
function buildOptionsWithMentions(players) {
  const mentions = players.map(p => p.jid);
  const text = players.map(p => `*ID ${p.id}* — ${atOf(p.jid)} ${p.nombre ? `(${p.nombre})` : ''}`).join('\n') || '(No hay opciones)';
  return { text, mentions };
}

// -----------------------------
// Fases
// -----------------------------
async function startRound(sock, game) {
  clearPhaseTimer(game);
  game.estado = 'Jugando';
  game.palabras = {}; // jid -> palabra
  game.votos = {};    // jid -> targetId
  game.votingCandidates = null; // ids si hay segunda vuelta
  game.turnoTimestamp = Date.now() + ROUND_TIME_MS;

  const vivos = alivePlayers(game);
  const roster = buildRosterWithMentions(vivos);

  await sock.sendMessage(game.chatId, {
    text:
`🟢 *Ronda ${game.ronda} — Digan UNA palabra relacionada* (sin revelar el nombre).
Comando en el grupo: \`.impostor palabra <tu_palabra>\`

*Jugadores vivos (${vivos.length}):*
${roster.text}

⏳ Tienen ${Math.floor(ROUND_TIME_MS/1000)}s. *OJO:* decir la *palabra prohibida* (el animal exacto) te elimina.`,
    mentions: roster.mentions
  });

  game.phaseTimer = setTimeout(async () => {
    if (game.estado !== 'Jugando') return;
    await closeRoundAndStartVoting(sock, game, true);
  }, ROUND_TIME_MS);
}

async function closeRoundAndStartVoting(sock, game, porTiempo = false) {
  clearPhaseTimer(game);
  if (game.estado !== 'Jugando') return;

  const vivos = alivePlayers(game);
  const lines = vivos.map(p => {
    const w = game.palabras[p.jid];
    return `• ${atOf(p.jid)}: ${w ? `_${w}_` : '—'}`;
  }).join('\n');
  const mentions = vivos.map(p => p.jid);

  await sock.sendMessage(game.chatId, {
    text:
`📝 *Palabras de la Ronda ${game.ronda}:*
${lines}

${porTiempo ? '⏰ Se acabó el tiempo.' : '✅ Palabras registradas.'} Ahora *voten en el grupo* quién es el impostor.`,
    mentions
  });

  await startVoting(sock, game);
}

async function startVoting(sock, game) {
  clearPhaseTimer(game);
  game.estado = 'Votando';
  game.votos = {};
  game.votingCandidates = null;
  game.turnoTimestamp = Date.now() + VOTE_TIME_MS;

  const vivos = alivePlayers(game);
  const opts = buildOptionsWithMentions(vivos);

  await sock.sendMessage(game.chatId, {
    text:
`🗳️ *VOTACIÓN (Ronda ${game.ronda})*
Vota con: \`.impostor votar <ID>\` o \`.impostor votar @usuario\`

*Opciones:*
${opts.text}

⏳ Tienen ${Math.floor(VOTE_TIME_MS/1000)}s.`,
    mentions: opts.mentions
  });

  game.phaseTimer = setTimeout(async () => {
    if (game.estado !== 'Votando') return;
    await tallyVotes(sock, game, true);
  }, VOTE_TIME_MS);
}

async function startRunoffVoting(sock, game, candidateIds) {
  clearPhaseTimer(game);
  game.estado = 'Votando2';
  game.votos = {};
  game.votingCandidates = candidateIds.slice(); // IDs empatados
  game.turnoTimestamp = Date.now() + RUNOFF_TIME_MS;

  const vivos = alivePlayers(game).filter(o => candidateIds.includes(o.id));
  const opts = buildOptionsWithMentions(vivos);

  await sock.sendMessage(game.chatId, {
    text:
`🗳️ *SEGUNDA VUELTA (Ronda ${game.ronda})*
Hay empate. Voten SOLO entre los empatados:
\`.impostor votar <ID>\` o \`.impostor votar @usuario\`

*Opciones (empatados):*
${opts.text}

⏳ Tienen ${Math.floor(RUNOFF_TIME_MS/1000)}s.`,
    mentions: opts.mentions
  });

  game.phaseTimer = setTimeout(async () => {
    if (game.estado !== 'Votando2') return;
    await tallyRunoffVotes(sock, game, true);
  }, RUNOFF_TIME_MS);
}

async function tallyVotes(sock, game, porTiempo = false) {
  clearPhaseTimer(game);
  if (game.estado !== 'Votando') return;

  const vivos = alivePlayers(game);
  const counts = new Map(); // id -> votos
  for (const voter of vivos) {
    const targetId = game.votos[voter.jid];
    if (!targetId) continue;
    counts.set(targetId, (counts.get(targetId) || 0) + 1);
  }

  const resumen = vivos.map(p => `• ${atOf(p.jid)} (ID ${p.id}): ${counts.get(p.id) || 0} voto(s)`).join('\n');
  const resumenMentions = vivos.map(p => p.jid);

  if (counts.size === 0) {
    await sock.sendMessage(game.chatId, {
      text:
`🗳️ *Votación cerrada*${porTiempo ? ' (tiempo agotado)' : ''}.
Nadie votó. 🤦‍♂️
${resumen}

📣 *Nadie es eliminado.* Siguiente ronda…`,
      mentions: resumenMentions
    });
    await nextRoundOrWin(sock, game, null);
    return;
  }

  let maxVotes = -1;
  let topIds = [];
  for (const [id, v] of counts.entries()) {
    if (v > maxVotes) { maxVotes = v; topIds = [id]; }
    else if (v === maxVotes) topIds.push(id);
  }

  if (topIds.length !== 1) {
    const empEmp = alivePlayers(game).filter(x => topIds.includes(x.id));
    const empText = empEmp.map(x => `• ${atOf(x.jid)} (ID ${x.id})`).join('\n');
    const empMentions = empEmp.map(x => x.jid);

    await sock.sendMessage(game.chatId, {
      text:
`🗳️ *Empate en la votación.* Se hará *segunda vuelta* entre:
${empText}

${resumen}`,
      mentions: [...new Set([...resumenMentions, ...empMentions])]
    });
    await startRunoffVoting(sock, game, topIds);
    return;
  }

  await eliminateById(sock, game, topIds[0], { text: resumen, mentions: resumenMentions });
}

async function tallyRunoffVotes(sock, game, porTiempo = false) {
  clearPhaseTimer(game);
  if (game.estado !== 'Votando2') return;

  const vivos = alivePlayers(game);
  const allowed = new Set(game.votingCandidates || []);
  const counts = new Map();

  for (const voter of vivos) {
    const targetId = game.votos[voter.jid];
    if (!targetId) continue;
    if (!allowed.has(targetId)) continue;
    counts.set(targetId, (counts.get(targetId) || 0) + 1);
  }

  const cand = vivos.filter(p => allowed.has(p.id));
  const resumen = cand.map(p => `• ${atOf(p.jid)} (ID ${p.id}): ${counts.get(p.id) || 0} voto(s)`).join('\n');
  const resumenMentions = cand.map(p => p.jid);

  if (counts.size === 0) {
    await sock.sendMessage(game.chatId, {
      text:
`🗳️ *Segunda vuelta cerrada*${porTiempo ? ' (tiempo agotado)' : ''}.
Nadie votó. 🤦‍♂️
${resumen || ''}

📣 *Nadie es eliminado.* Siguiente ronda…`,
      mentions: resumenMentions
    });
    await nextRoundOrWin(sock, game, null);
    return;
  }

  let maxVotes = -1;
  let topIds = [];
  for (const [id, v] of counts.entries()) {
    if (v > maxVotes) { maxVotes = v; topIds = [id]; }
    else if (v === maxVotes) topIds.push(id);
  }

  if (topIds.length !== 1) {
    await sock.sendMessage(game.chatId, {
      text:
`🗳️ *Segunda vuelta empatada.* No habrá eliminado esta ronda.
${resumen || ''}`,
      mentions: resumenMentions
    });
    await nextRoundOrWin(sock, game, null);
    return;
  }

  await eliminateById(sock, game, topIds[0], { text: resumen, mentions: resumenMentions });
}

async function eliminateById(sock, game, eliminatedId, resumenObj) {
  const elim = game.jugadores.find(p => p.id === eliminatedId);
  if (!elim || !elim.alive) {
    await sock.sendMessage(game.chatId, { text: '⚠️ Error al eliminar (ID inválido). Se continúa sin eliminación.' });
    await nextRoundOrWin(sock, game, null);
    return;
  }

  elim.alive = false;
  const wasImp = elim.role === 'impostor';

  const text =
`☠️ *Eliminado:* ${nameOrAt(elim.jid)} (ID ${elim.id}) — era *${wasImp ? 'IMPOSTOR' : 'Tripulante'}*.
${resumenObj?.text ? `\n${resumenObj.text}` : ''}`;

  await sock.sendMessage(game.chatId, { text, mentions: [elim.jid, ...(resumenObj?.mentions || [])] });

  if (wasImp) {
    await endGame(sock, game, '🏆 *¡Los tripulantes ganan!* Encontraron al impostor.');
    return;
  }

  const vivosRestantes = alivePlayers(game).length;
  const impAlive = game.jugadores.find(p => p.role === 'impostor')?.alive;
  if (impAlive && vivosRestantes <= 2) {
    await endGame(sock, game, '🕵️‍♂️ *¡El impostor gana!* Sobrevivió hasta quedar 2.');
    return;
  }

  await nextRoundOrWin(sock, game, elim);
}

async function nextRoundOrWin(sock, game, eliminated) {
  game.ronda += 1;
  await startRound(sock, game);
}

async function endGame(sock, game, message) {
  clearPhaseTimer(game);
  game.estado = 'Finalizado';
  await sock.sendMessage(game.chatId, { text: message });
  delete global.impostorGames[game.chatId];
}

// -----------------------------
// Comando principal
// -----------------------------
export const command = 'impostor';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const sub = (args[0] || '').toLowerCase();

  const isGroup = from.endsWith('@g.us');
  if (!isGroup) {
    return sock.sendMessage(from, { text: '❌ Usa `.impostor` *en el grupo*.' });
  }

  const game = global.impostorGames[from];

  // .impostor crear
  if (sub === 'crear') {
    if (game && game.estado !== 'Finalizado') {
      return sock.sendMessage(from, { text: '⚠️ Ya hay una sala activa en este grupo.' }, { quoted: msg });
    }
    const ownerName = getName(sock, sender);
    global.impostorGames[from] = {
      chatId: from,
      owner: sender,
      estado: 'Esperando',
      jugadores: [{ jid: sender, nombre: ownerName, id: 1, alive: true, role: null, esOwner: true }],
      animal: null,
      impostorJid: null,
      ronda: 1,
      palabras: {},
      votos: {},
      votingCandidates: null, // ids en segunda vuelta
      turnoTimestamp: 0,
      phaseTimer: null
    };
    const roster = buildRosterWithMentions([{ jid: sender, nombre: ownerName, id: 1, alive: true }]);
    return sock.sendMessage(from, {
      text:
`🕵️ *Sala de Impostor creada por* ${atOf(sender)}.

Para unirse: \`.impostor join\`
Para iniciar (3–12 jugadores): \`.impostor iniciar\`
Ayuda: \`.impostor ayuda\``,
      mentions: roster.mentions
    }, { quoted: msg });
  }

  // .impostor join
  if (sub === 'join') {
    if (!game || game.estado !== 'Esperando') {
      return sock.sendMessage(from, { text: '❌ No hay sala en espera. Usa `.impostor crear`.' }, { quoted: msg });
    }
    if (game.jugadores.length >= 12) {
      return sock.sendMessage(from, { text: '❌ La sala está llena (máx. 8).' }, { quoted: msg });
    }
    if (game.jugadores.some(p => p.jid === sender)) {
      return sock.sendMessage(from, { text: '⚠️ Ya estás en la sala.' }, { quoted: msg });
    }
    const nombre = getName(sock, sender);
    game.jugadores.push({ jid: sender, nombre, id: game.jugadores.length + 1, alive: true, role: null, esOwner: false });

    const vivos = game.jugadores;
    const roster = buildRosterWithMentions(vivos);
    return sock.sendMessage(from, {
      text: `✅ ${atOf(sender)} se unió.\n\n*Jugadores (${vivos.length}/8):*\n${roster.text}`,
      mentions: roster.mentions
    }, { quoted: msg });
  }

  // .impostor iniciar
  if (sub === 'iniciar') {
    if (!game || game.estado !== 'Esperando') {
      return sock.sendMessage(from, { text: '❌ No hay sala lista para iniciar.' }, { quoted: msg });
    }
    if (game.jugadores.length < 3) {
      return sock.sendMessage(from, { text: '❌ Se necesitan *mínimo 3* jugadores.' }, { quoted: msg });
    }
    if (game.jugadores[0].jid !== sender) {
      return sock.sendMessage(from, { text: '❌ Solo el *creador* puede iniciar.' }, { quoted: msg });
    }

    // Asignar animal e impostor
    game.animal = pickRandom(ANIMALS);
    const impostor = pickRandom(game.jugadores);
    game.impostorJid = impostor.jid;

    for (const pj of game.jugadores) {
      pj.role = (pj.jid === game.impostorJid) ? 'impostor' : 'crew';
      pj.alive = true;
    }
    game.ronda = 1;
    game.estado = 'Preparando';

    // Roles por DM
    for (const pj of game.jugadores) {
      if (pj.role === 'impostor') {
        await sock.sendMessage(pj.jid, {
          text:
`🕵️‍♂️ *ROL:* IMPOSTOR
No conoces la palabra.
Tu objetivo es pasar desapercibido y sobrevivir hasta quedar 2.`
        });
      } else {
        await sock.sendMessage(pj.jid, {
          text:
`👥 *ROL:* Tripulante
*PALABRA:* ${game.animal}
No reveles el nombre; usa palabras relacionadas.`
        });
      }
    }

    const roster = buildRosterWithMentions(game.jugadores);
    await sock.sendMessage(from, {
      text:
`✅ *Partida iniciada.* Jugadores: ${game.jugadores.length}.
Se enviaron los *roles por DM*.

📣 En cada ronda, todos dirán *una palabra* (grupo) con \`.impostor palabra <tu_palabra>\`. Luego *votan en el grupo* con \`.impostor votar <ID>|@usuario\`.

⚠️ *Palabra prohibida*: si dices la palabra exacta, quedas *eliminado*.`,
      mentions: roster.mentions
    });

    await startRound(sock, game);
    return;
  }

  // .impostor palabra <palabra> (grupo)
  if (sub === 'palabra') {
    const game = global.impostorGames[from];
    if (!game || game.estado !== 'Jugando') {
      return sock.sendMessage(from, { text: '❌ No hay ronda activa para palabras ahora.' });
    }
    const pj = game.jugadores.find(p => p.jid === sender);
    if (!pj || !pj.alive) {
      return sock.sendMessage(from, { text: '❌ No estás en la partida o has sido eliminado.' });
    }

    const palabra = sanitizeWord(args.slice(1).join(' '));
    if (!palabra) {
      return sock.sendMessage(from, { text: '❌ Debes escribir una palabra. Ej.: `.impostor palabra colmillos`' });
    }
    if (game.palabras[pj.jid]) {
      return sock.sendMessage(from, { text: '⚠️ Ya enviaste tu palabra en esta ronda.' });
    }

    // Palabra prohibida: animal exacto
    if (norm(palabra) === norm(game.animal)) {
      pj.alive = false; // eliminación inmediata
      const text = `⛔️ *Palabra prohibida*: ${nameOrAtForSender(pj.jid, msg)} dijo la *palabra exacta* y fue *eliminado*.`;
      await sock.sendMessage(game.chatId, { text, mentions: [pj.jid] });

      if (pj.role === 'impostor') {
        await endGame(sock, game, '🏆 *¡Los tripulantes ganan!* El impostor se delató.');
        return;
      }
      const vivosRestantes = alivePlayers(game).length;
      const impAlive = game.jugadores.find(p => p.role === 'impostor')?.alive;
      if (impAlive && vivosRestantes <= 2) {
        await endGame(sock, game, '🕵️‍♂️ *¡El impostor gana!* Quedaron 2 vivos.');
        return;
      }

      const faltan0 = alivePlayers(game).filter(p => !game.palabras[p.jid]).length;
      if (faltan0 === 0) {
        await closeRoundAndStartVoting(sock, game, false);
      }
      return;
    }

    // Registrar palabra válida
    game.palabras[pj.jid] = palabra;

    const vivos = alivePlayers(game);
    const faltan = vivos.filter(p => !game.palabras[p.jid]).length;

    const ack = `🗣️ ${nameOrAtForSender(pj.jid, msg)} aportó su palabra. Faltan ${faltan}.`;
    await sock.sendMessage(from, { text: ack, mentions: [pj.jid] });

    if (faltan === 0) {
      await closeRoundAndStartVoting(sock, game, false);
    }
    return;
  }

  // .impostor votar <ID>|@usuario  (grupo — última votación cuenta)
  if (sub === 'votar') {
    const game = global.impostorGames[from];
    if (!game || (game.estado !== 'Votando' && game.estado !== 'Votando2')) {
      return sock.sendMessage(from, { text: '❌ No estamos en fase de votación.' });
    }
    const pj = game.jugadores.find(p => p.jid === sender);
    if (!pj || !pj.alive) return sock.sendMessage(from, { text: '❌ No puedes votar (no estás vivo).' });

    // 1) Intentar por @mención
    const mentioned = getMentionedJids(msg)
      .map(j => game.jugadores.find(p => p.jid === j && p.alive))
      .filter(Boolean);
    let target = mentioned[0] || null;

    // 2) Si no hay mención válida, intentar por ID
    if (!target) {
      const idStr = args[1];
      const targetId = parseInt((idStr || '').trim(), 10);
      if (Number.isFinite(targetId)) {
        target = game.jugadores.find(p => p.id === targetId && p.alive) || null;
      }
    }

    if (!target) return sock.sendMessage(from, { text: '❌ Indica un objetivo válido: `.impostor votar <ID>` o `.impostor votar @usuario`.' });
    if (game.estado === 'Votando2' && game.votingCandidates && !game.votingCandidates.includes(target.id)) {
      return sock.sendMessage(from, { text: '❌ Segunda vuelta: vota solo entre los *empatados*.' });
    }
    if (target.jid === pj.jid) return sock.sendMessage(from, { text: '❌ No puedes votarte a ti mismo.' });

    // Registrar voto (si vuelve a votar, se reemplaza)
    game.votos[pj.jid] = target.id;

    const votoText = `✅ ${nameOrAtForSender(pj.jid, msg)} votó por ${nameOrAt(target.jid)} (ID ${target.id}).`;
    await sock.sendMessage(from, { text: votoText, mentions: [pj.jid, target.jid] });

    // ¿Ya votaron todos los vivos?
    const vivos = alivePlayers(game);
    const totalVivos = vivos.length;
    const votosRecibidos = Object.keys(game.votos).length;
    if (votosRecibidos >= totalVivos) {
      if (game.estado === 'Votando2') await tallyRunoffVotes(sock, game, false);
      else await tallyVotes(sock, game, false);
    }
    return;
  }

  // .impostor estado (grupo)
  if (sub === 'estado') {
    const game = global.impostorGames[from];
    if (!game) return sock.sendMessage(from, { text: '❌ No hay sala/partida en este grupo.' });

    const vivos = alivePlayers(game);
    const roster = buildRosterWithMentions(vivos);
    let fase = game.estado;
    if (fase === 'Jugando')  fase = `Jugando (palabras) — ${Math.max(0, Math.ceil((game.turnoTimestamp - Date.now())/1000))}s`;
    if (fase === 'Votando')  fase = `Votando (grupo) — ${Math.max(0, Math.ceil((game.turnoTimestamp - Date.now())/1000))}s`;
    if (fase === 'Votando2') fase = `Segunda vuelta (grupo) — ${Math.max(0, Math.ceil((game.turnoTimestamp - Date.now())/1000))}s`;

    return sock.sendMessage(from, {
      text:
`📊 *Estado — Ronda ${game.ronda}*
Fase: ${fase}

*Vivos (${vivos.length}):*
${roster.text}

⚠️ Palabra prohibida activa: decir el *animal exacto* te elimina.`,
      mentions: roster.mentions
    });
  }

  // .impostor abandonar (creador)
  if (sub === 'abandonar') {
    const game = global.impostorGames[from];
    if (!game) return sock.sendMessage(from, { text: '❌ No hay sala/partida en este grupo.' });
    if (game.owner !== sender) {
      return sock.sendMessage(from, { text: '❌ Solo el *creador* puede finalizar la sala/partida.' });
    }
    await endGame(sock, game, '🛑 *Partida finalizada por el creador.*');
    return;
  }

  // .impostor ayuda (y default)
  if (sub === 'ayuda' || !sub) {
    return sock.sendMessage(from, {
      text:
`🕵️ *Impostor — Juego de Palabras*
\`.impostor crear\` — Crea sala (grupo)
\`.impostor join\` — Únete (3–12 jugadores)
\`.impostor iniciar\` — Inicia (creador)
\`.impostor palabra <tu_palabra>\` — Aporta en la ronda (grupo)
\`.impostor votar <ID>|@usuario\` — Vota en el grupo
\`.impostor estado\` — Ver progreso
\`.impostor abandonar\` — Finaliza (creador)

*Reglas:*
• Todos reciben la *palabra* por DM, excepto 1 *impostor* (no lo conoce).
• Cada ronda: *una palabra* por vivo y *votación en el grupo*.
• *Palabra prohibida:* si dices la palabra exacta → *eliminado*.
• Si eliminan al impostor → *Ganan tripulantes*.
• Si el impostor sobrevive hasta quedar *solo 2 vivos* → *Gana el impostor*.
• Empate → *segunda vuelta* solo entre empatados. Si vuelve a empatar, *nadie eliminado*.`
    });
  }

  return sock.sendMessage(from, { text: '❌ Subcomando inválido. Usa `.impostor ayuda`.' });
}
