// jugada.js
import {
  CONTRATOS,
  getName,
  nextTurn,
  notifyTurn,
  formatHand,
  formatCard,
  parseCardInput,
  generateDeck, // por si reponemos mazo
  GAME_TIME_LIMIT_MS
} from './carioca.js';

// Puntuación (ajústala a tu reglamento)
function calculatePoints(hand) {
  const CARD_VALUES = {
    '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 10, 'A': 20, 'JOKER': 30
  };
  return hand.reduce((sum, card) => sum + (CARD_VALUES[card.v] ?? 0), 0);
}

function getCardRank(card) {
  if (card.v === 'JOKER') return 14;
  if (card.v === 'A') return 1;
  if (card.v === 'J') return 11;
  if (card.v === 'Q') return 12;
  if (card.v === 'K') return 13;
  return parseInt(card.v, 10);
}

function isValidSet(cards) {
  // Devuelve 'trio' | 'escala' | false
  if (cards.length < 3) return false;
  const jokers = cards.filter(c => c.v === 'JOKER').length;
  if (jokers > 1) return false; // máx. 1 comodín por set

  // ¿Trío? (mismo valor)
  if (cards.length === 3 || cards.length === 4) {
    const nonJoker = cards.filter(c => c.v !== 'JOKER').map(getCardRank);
    if (nonJoker.length > 0 && nonJoker.every(r => r === nonJoker[0])) return 'trio';
  }

  // ¿Escala? (misma pinta y consecutivas; comodín rellena huecos)
  if (cards.length >= 4) {
    const nonJokerSuits = cards.filter(c => c.v !== 'JOKER').map(c => c.p);
    if (nonJokerSuits.length > 0 && !nonJokerSuits.every(s => s === nonJokerSuits[0])) return false;

    const baseRanks = cards.filter(c => c.v !== 'JOKER').map(getCardRank).sort((a, b) => a - b);
    if (baseRanks.length >= 3) {
      let missing = 0;
      for (let i = 0; i < baseRanks.length - 1; i++) {
        const diff = baseRanks[i + 1] - baseRanks[i];
        if (diff <= 0) return false;        // duplicados/retrocesos no permitidos
        if (diff > 1) missing += (diff - 1);
      }
      if (missing <= jokers) return 'escala';
    }
  }

  return false;
}

function drawFromMazo(game) {
  if (!game.mazo || game.mazo.length === 0) {
    game.mazo = generateDeck();
  }
  return game.mazo.pop();
}

// Valida si la composición de sets cumple el contrato de la ronda (para R1..R8)
function satisfiesContractComposition(round, sets) {
  const def = CONTRATOS.find(c => c.ronda === round);
  if (!def?.req) return true; // R9/R10 sin validación de composición aquí

  const counts = { trio: 0, escala: 0 };
  for (const s of sets) {
    if (s.type === 'trio') counts.trio++;
    else if (s.type === 'escala') counts.escala++;
  }
  return counts.trio >= (def.req.trio || 0) && counts.escala >= (def.req.escala || 0);
}

// -----------------------------
// Gestión de rondas
// -----------------------------

async function endRound(sock, game, winnerJid) {
  let scoresMsg = `\n\n*RESULTADOS DE RONDA ${game.rondaActual} (Ganador: ${getName(sock, winnerJid)})*:\n`;

  for (const player of game.jugadores) {
    if (player.jid !== winnerJid) {
      const points = calculatePoints(player.mano);
      player.puntaje += points;
      scoresMsg += `\n*${player.nombre}* | Puntos en mano: ${points} | Total: ${player.puntaje}`;
    } else {
      scoresMsg += `\n*${player.nombre}* | ¡Carioca! Puntos en mano: 0 | Total: ${player.puntaje}`;
    }
  }

  // ¿Fin de partida?
  if (game.rondaActual >= 10) {
    game.estado = 'Finalizado';
    scoresMsg += `\n\n--- 🏆 *FIN DE LA PARTIDA* 🏆 ---`;
    const final = [...game.jugadores].sort((a, b) => a.puntaje - b.puntaje);
    scoresMsg += `\nGanador: *${final[0].nombre}* con ${final[0].puntaje} puntos.`;
    await sock.sendMessage(game.chatId, { text: scoresMsg });
    clearTimeout(game.turnTimer);
    delete global.cariocaGames[game.chatId];
    return;
  }

  // Siguiente ronda
  game.rondaActual++;
  const nextContract = CONTRATOS.find(c => c.ronda === game.rondaActual);
  game.contrato = nextContract.nombre;

  // Repartir cartas: 13 para R9..R10
  const cardsToDeal = game.rondaActual >= 9 ? 13 : 12;
  game.mazo = generateDeck();
  game.pozo = drawFromMazo(game);
  game.turnoDe = winnerJid;

  for (const player of game.jugadores) {
    player.mano = [];
    player.haBajado = false;
    player.juegosBajados = [];
    for (let i = 0; i < cardsToDeal; i++) player.mano.push(drawFromMazo(game));
  }

  await sock.sendMessage(game.chatId, { text: scoresMsg });
  await sock.sendMessage(game.chatId, {
    text: `\n--- ➡️ *INICIO DE RONDA ${game.rondaActual}* ---\nContrato: *${game.contrato}*.\n\n🎲 Turno de *${getName(sock, game.turnoDe)}* (Ganador anterior).`
  });

  await notifyTurn(sock, game, game.turnoDe);
}

// -----------------------------
// Comando .jugada
// -----------------------------

export const command = 'jugada';

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const playerJid = msg.key.participant || from;

  if (from.endsWith('@s.whatsapp.net')) {
    return sock.sendMessage(from, { text: '❌ El comando `.jugada` debe usarse *en el grupo* donde se juega.' });
  }

  const game = global.cariocaGames[from];
  if (!game || game.estado !== 'Jugando') {
    return sock.sendMessage(from, { text: '❌ No hay una partida de Carioca en curso en este grupo.' });
  }

  const player = game.jugadores.find(p => p.jid === playerJid);
  if (!player) return sock.sendMessage(from, { text: '❌ No estás en esta partida.' });

  const subCommand = (args[0] || '').toLowerCase();
  const target = (args[1] || '').toLowerCase();

  if (game.turnoDe !== playerJid) {
    return sock.sendMessage(from, { text: `⚠️ No es tu turno, *${getName(sock, playerJid)}*. El turno es de ${getName(sock, game.turnoDe)}.` });
  }

  // ------------- RECOGER -------------
  if (subCommand === 'recoger') {
    if (game.estadoTurno !== 'Robar') {
      return sock.sendMessage(from, { text: `⚠️ *${player.nombre}*, ya robaste. Usa \`.jugada descartar <carta>\`, \`.jugada bajartodo\` o \`.jugada lanzar\`.` });
    }

    let card = null;
    if (target === 'mazo') {
      card = drawFromMazo(game);
      await sock.sendMessage(from, { text: `✅ *${player.nombre}* robó del mazo.` });
    } else if (target === 'pozo' && game.pozo) {
      card = game.pozo;
      game.pozo = null;
      await sock.sendMessage(from, { text: `✅ *${player.nombre}* recogió ${formatCard(card)} del pozo.` });
    } else {
      return sock.sendMessage(from, { text: '❌ Uso: `.jugada recoger mazo` o `.jugada recoger pozo`.' });
    }

    player.mano.push(card);
    game.estadoTurno = 'Botar';

    const msgText = `*TU MANO (Ronda ${game.rondaActual}):*\n${formatHand(player.mano)}\n\n*OPCIONES:* \`.jugada bajartodo <sets>\` / \`.jugada lanzar <ID> <Carta>\` / \`.jugada descartar <Carta>\``;
    return sock.sendMessage(from, { text: msgText });
  }

  // ------------- DESCARTAR -------------
  if (subCommand === 'descartar') {
    if (game.estadoTurno !== 'Botar') {
      return sock.sendMessage(from, { text: `⚠️ *${player.nombre}*, primero debes *recoger* una carta (\`.jugada recoger ...\`).` });
    }

    const cardInputRaw = args.slice(1).join(' ');
    const parsed = parseCardInput(cardInputRaw);

    if (!parsed) {
      return sock.sendMessage(from, { text: '❌ Carta inválida. Ej.: `.jugada descartar 5C` o `.jugada descartar K♠️` o `.jugada descartar JOKER`.' });
    }
    if (parsed.v === 'JOKER' && parsed.p !== '★') {
      return sock.sendMessage(from, { text: `❌ El JOKER debe indicarse como *JOKER* o *JOKER★*.` });
    }

    const idx = player.mano.findIndex(c => c.v === parsed.v && c.p === parsed.p);
    if (idx === -1) {
      return sock.sendMessage(from, { text: `❌ No tienes la carta ${parsed.v}${parsed.p} en tu mano.` });
    }

    const discarded = player.mano.splice(idx, 1)[0];
    game.pozo = discarded;

    // ¿Cerró?
    if (player.mano.length === 0) {
      await endRound(sock, game, playerJid);
      return sock.sendMessage(from, { text: `🎉 *${player.nombre}* ganó la ronda descartando ${formatCard(discarded)}.` });
    }

    const nextJid = nextTurn(game);
    await sock.sendMessage(from, { text: `➡️ *${player.nombre}* descartó ${formatCard(discarded)}. Turno de *${getName(sock, nextJid)}*.` });
    await notifyTurn(sock, game, nextJid);
    return;
  }

  // ------------- BAJAR TODO -------------
  if (subCommand === 'bajartodo') {
    if (player.haBajado) {
      return sock.sendMessage(from, { text: `⚠️ *${player.nombre}*, ya bajaste en esta ronda.` });
    }

    const raw = args.slice(1).join(' ').trim();
    if (!raw) {
      return sock.sendMessage(from, { text: '❌ Debes especificar los juegos. Ej.: `.jugada bajartodo 5C,5D,5H / 6H,7H,8H,9H`' });
    }

    // Copia temporal de la mano para validar consumo de cartas sin duplicar
    const available = JSON.parse(JSON.stringify(player.mano));
    const sets = [];
    let total = 0;

    const groups = raw.split('/').map(s => s.trim()).filter(Boolean);
    for (const g of groups) {
      const tokens = g.split(',').map(s => s.trim()).filter(Boolean);
      if (tokens.length < 3) return sock.sendMessage(from, { text: `❌ El conjunto "${g}" tiene menos de 3 cartas.` });

      const cards = [];
      for (const tok of tokens) {
        const parsed = parseCardInput(tok);
        if (!parsed) return sock.sendMessage(from, { text: `❌ La carta *${tok}* no tiene un formato válido.` });

        // buscar y consumir de available
        const i = available.findIndex(c => c.v === parsed.v && c.p === parsed.p);
        if (i === -1) return sock.sendMessage(from, { text: `❌ No tienes *${parsed.v}${parsed.p}* disponible para bajar.` });

        cards.push(available[i]);
        available.splice(i, 1);
      }

      const kind = isValidSet(cards);
      if (!kind) return sock.sendMessage(from, { text: `❌ "${formatHand(cards)}" no es Trío ni Escala válida.` });

      sets.push({ type: kind, cards });
      total += cards.length;
    }

    const contract = CONTRATOS.find(c => c.ronda === game.rondaActual);
    if (total < contract.minCartas) {
      return sock.sendMessage(from, { text: `❌ Ronda ${game.rondaActual} requiere *${contract.minCartas}* cartas mínimo. Bajaste ${total}.` });
    }

    if (!satisfiesContractComposition(game.rondaActual, sets)) {
      return sock.sendMessage(from, { text: `❌ La composición de tus juegos no cumple el contrato: *${contract.nombre}*.` });
    }

    // Aplicar: sacar de mano real y guardar juegos bajados
    for (const { cards } of sets) {
      for (const card of cards) {
        const i = player.mano.findIndex(c => c.v === card.v && c.p === card.p);
        if (i !== -1) player.mano.splice(i, 1);
      }
      player.juegosBajados.push(cards);
    }
    player.haBajado = true;

    await sock.sendMessage(from, { text: `🎉 *${player.nombre}* bajó sus juegos.\n\n*Juegos:*\n${player.juegosBajados.map(j => formatHand(j)).join('\n')}\n\nCartas restantes: ${player.mano.length}.` });
    return;
  }

  // ------------- LANZAR -------------
  if (subCommand === 'lanzar') {
    if (!player.haBajado) {
      return sock.sendMessage(from, { text: `⚠️ *${player.nombre}*, primero debes bajar (\`.jugada bajartodo\`).` });
    }

    const targetId = parseInt(target, 10);
    const cardInput = args.slice(2).join(' ');
    if (!targetId || !cardInput) {
      return sock.sendMessage(from, { text: '❌ Uso: `.jugada lanzar <ID_JUGADOR> <Carta>` (Ej.: `.jugada lanzar 2 7D`)' });
    }

    const targetPlayer = game.jugadores.find(p => p.id === targetId);
    if (!targetPlayer) return sock.sendMessage(from, { text: `❌ ID de jugador ${targetId} no existe.` });

    const parsed = parseCardInput(cardInput);
    if (!parsed) return sock.sendMessage(from, { text: '❌ Carta inválida para lanzar.' });

    const idx = player.mano.findIndex(c => c.v === parsed.v && c.p === parsed.p);
    if (idx === -1) return sock.sendMessage(from, { text: `❌ No tienes *${parsed.v}${parsed.p}* en tu mano.` });

    const cardToLaunch = player.mano[idx];

    let launched = false;
    for (const set of targetPlayer.juegosBajados) {
      const test = [...set, cardToLaunch];
      if (isValidSet(test)) {
        // aplicar
        player.mano.splice(idx, 1);
        set.push(cardToLaunch);
        launched = true;
        break;
      }
    }

    if (!launched) {
      return sock.sendMessage(from, { text: `❌ ${formatCard(cardToLaunch)} no encaja en los juegos de *${targetPlayer.nombre}*.` });
    }

    await sock.sendMessage(from, { text: `🚀 *${player.nombre}* lanzó ${formatCard(cardToLaunch)} al juego de *${targetPlayer.nombre}*. Le quedan ${player.mano.length} cartas.` });
    return;
  }

  return sock.sendMessage(from, {
    text: `❌ Comando no válido.\nOpciones:\n\`.jugada recoger mazo/pozo\`\n\`.jugada descartar <Carta>\`\n\`.jugada bajartodo <sets>\`\n\`.jugada lanzar <ID_JUGADOR> <Carta>\``
  });
}
