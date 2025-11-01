import fetch from 'node-fetch';
import { cargarDatabase, guardarDatabase } from '../data/database.js';

export const command = 'chatgpt';

// 🔑 API key
const API_KEY = '96bde0ae57397e48';

// 📏 Límite de interacciones en memoria de trabajo antes de resumir
const MEMORY_LIMIT = 20;

// 📏 Para mostrar en debug nada más (no afecta contexto del bot)
const MAX_RESPONSE_CHARS = 60;

// 📦 Cada cuántas interacciones disparamos el resumen largo
const RESUME_TRIGGER = 10;

// 🌐 Cada cuántos resúmenes hacemos un meta-resumen
const META_RESUME_TRIGGER = 3;

// 🧠 Cuántas interacciones recientes mantenemos SIN resumir al limpiar
const KEEP_RECENT = 3;

// 🔧 Llamada al endpoint de tu API
async function callChatAPI({ prompt, system }) {
  const params = new URLSearchParams();
  params.append('prompt', prompt);
  if (system) params.append('system', system);
  params.append('api_key', API_KEY);

  const url = `https://loveapi-tools.miangel.dev/api/v1/chat?${params.toString()}`;

  const resp = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' } });
  const raw = await resp.text();

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${raw}`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    throw new Error(`JSON inválido desde la API: ${raw}`);
  }

  if (!data || typeof data.response !== 'string') {
    throw new Error('Campo \`response\` ausente o inválido en la respuesta.');
  }

  // data.response puede ser:
  //  - modo "chat": JSON string con reply + memory_fragments
  //  - modo "resumen": texto plano con resumen
  return data.response;
}

export async function run(sock, msg, args) {
  const from = msg.key.remoteJid;
  const sender = msg.key.participant || msg.key.remoteJid;
  const pushName = msg.pushName || 'Usuario';

  const userText = args.join(' ').trim();
  if (!userText) {
    return sock.sendMessage(from, {
      text: '❌ Por favor, ingresa algo para que PandaBot te responda. Ejemplo: `.chatgpt ¿Cómo estás?`'
    });
  }

  // Cargar / inicializar DB
  const db = cargarDatabase();
  db.users = db.users || {};

  // En grupos, memorizamos por grupo completo.
  // En privado, memorizamos por la persona.
  const chatId = from.endsWith('@g.us') ? from : sender;

  db.users[chatId] = db.users[chatId] || {};
  db.users[chatId].memoria = db.users[chatId].memoria || [];
  db.users[chatId].resumenes = db.users[chatId].resumenes || [];

  // 🧩 Subcomando: mostrar memorias y resúmenes
  if (userText.toLowerCase() === 'memorias') {
    const mem = db.users[chatId].memoria;
    const resums = db.users[chatId].resumenes;

    let texto = '🧠 *Memoria de PandaBot para este chat*\n\n';

    if (mem.length) {
      const ultimas = mem
        .slice(-5)
        .map((m, i) => {
          const frags = (m.memory_fragments && m.memory_fragments.length)
            ? m.memory_fragments.map(f => `   - ${f}`).join('\n')
            : '   (sin fragmentos de memoria)';
          return `*${i + 1}.* 👤 ${m.name} dijo: ${m.prompt}\n🤖 PandaBot respondió: ${m.response_short}\n📌 Memoria detectada:\n${frags}`;
        })
        .join('\n\n');

      texto += `🗨️ *Últimas interacciones guardadas:*\n\n${ultimas}\n\n`;
    } else {
      texto += '🗨️ No hay interacciones recientes guardadas.\n\n';
    }

    if (resums.length) {
      const resumenesTxt = resums
        .map((r, i) => `*${i + 1}.* ${r}`)
        .join('\n\n');

      texto += `📜 *Resúmenes consolidados:*\n\n${resumenesTxt}\n\n_Total de resúmenes: ${resums.length}_`;
    } else {
      texto += '📜 No hay resúmenes guardados aún.';
    }

    await sock.sendMessage(from, { text: texto.trim() }, { quoted: msg });
    return;
  }

  // 🧨 Subcomando: olvidar memoria
  if (userText.toLowerCase() === 'olvidar') {
    db.users[chatId].memoria = [];
    db.users[chatId].resumenes = [];
    guardarDatabase(db);
    await sock.sendMessage(
      from,
      { text: '🧠 He olvidado toda la memoria temporal y los resúmenes de este chat. 🗑️' },
      { quoted: msg }
    );
    return;
  }

  // 🧠 Construir historial reciente para meterlo al systemPrompt
  // Usamos response_full para no perder contexto de la respuesta anterior
  const historial = db.users[chatId].memoria
    .map(m => {
      return `👤 ${m.name}: ${m.prompt}\n🤖 PandaBot: ${m.response_full}`;
    })
    .join('\n\n');

  // 📜 Resúmenes largos ya consolidados
  const resumenesPrevios = db.users[chatId].resumenes
    .map(r => `• ${r}`)
    .join('\n');

  // ⚙️ systemPrompt sin filtros:
  //
  // - El bot ya no tiene que ser "tierno", ni "respetuoso", ni evitar ser directo.
  // - Puede usar el mismo tono que el grupo: vulgar, pesado, sarcástico, burla directa, etc.
  // - Le decimos literalmente que no se censure.
  //
  // - Seguimos con el output JSON obligatorio { reply, memory_fragments }.
  // - Reforzamos que SIEMPRE meta en memory_fragments TODO lo que parezca importante,
  //   aunque suene obvio. O sea: más agresivo para retener info.
  const systemPrompt = `
Eres PandaBot.

Memoria histórica estable (resúmenes previos de este chat):
${resumenesPrevios || '(sin resúmenes previos)'}

Memoria de trabajo (últimos mensajes reales sin resumir):
${historial || '(sin historial previo)'}

Instrucciones IMPORTANTES:

1. Personalidad / tono:
   - Tu tono debe copiar el tono del chat en este momento.
   - Puedes ser directo, burlarte, usar sarcasmo pesado, hablar con groserías, responder sin filtro.
   - No te autocensures en tu forma de hablar: si el chat está informal, tú también.
   - Habla en español.

2. Tu salida FINAL debe ser SOLO un JSON válido (sin \`\`\`, sin comentarios).
   Debe tener EXACTAMENTE estas claves:
   {
     "reply": "mensaje que PandaBot le va a mandar al chat, usando el mismo tipo de tono/actitud que tiene el grupo ahora mismo",
     "memory_fragments": [
       "hecho importante y duradero que dijo alguien en esta interacción",
       "preferencia personal declarada por alguien (cómo quiere que le hablen, apodo, límites, rol)",
       "decisión técnica concreta o paso siguiente acordado",
       "plan futuro claro",
       "quién es responsable de qué cosa"
     ]
   }

3. "memory_fragments":
   - Es una lista de strings.
   - Cada string debe ser un dato útil para recordar más adelante.
   - Ejemplos:
     - "Miguel quiere que lo llamen Miguel."
     - "Miguel va a usar MariaDB en producción."
     - "Miguel es el que administra LoveApiTools."
     - "Ana dijo que le hablen sin formalidad y con confianza."
     - "Carlos no quiere que le cambien el apodo."
     - "Miguel dijo que él se encarga del deploy del backend."
   - IMPORTANTE: En este chat hablan varias personas. Cada fragmento debe decir quién lo dijo o a quién aplica, tipo "Miguel: ...", "Ana: ...".
   - IMPORTANTE 2: Si crees que algo posiblemente sea importante a futuro, INCLÚYELO IGUAL. No seas tímido. Más vale guardarlo que perderlo.
   - Si de verdad no hay nada recordable en este turno, usa "memory_fragments": [].

4. El campo "reply":
   - Es la respuesta lista para mandarse al chat.
   - Puedes contestar en el mismo tono que te hablaron: serio, agresivo, sarcástico, chill, lo que sea.
   - Puedes mencionar al usuario por su nombre directamente.

5. Repite: Tu salida debe ser ÚNICAMENTE ese JSON, sin nada más.
`.trim();

  // Prompt específico de este turno
  const fullPrompt = `
El usuario "${pushName}" acaba de decir literalmente:
"${userText}"

Responde siguiendo TODAS las reglas indicadas.
`.trim();

  await sock.sendMessage(from, { react: { text: '⏳️', key: msg.key } });

  try {
    //
    // 1. Llamar API para generar respuesta normal
    //
    const generated = await callChatAPI({
      prompt: fullPrompt,
      system: systemPrompt
    });

    // 2. Parsear respuesta JSON del modelo
    let botPayload;
    try {
      botPayload = JSON.parse(generated);
    } catch (e) {
      // fallback duro si el modelo no respetó el formato
      botPayload = {
        reply: generated,
        memory_fragments: []
      };
    }

    if (typeof botPayload.reply !== 'string') {
      botPayload.reply = String(botPayload.reply ?? '');
    }
    if (!Array.isArray(botPayload.memory_fragments)) {
      botPayload.memory_fragments = [];
    }

    // 3. Atribuir autor a cada fragmento del modelo si no viene ya atribuido
    let attributedFragments = botPayload.memory_fragments
      .map(f => {
        if (typeof f !== 'string') return null;
        const clean = f.trim();
        if (!clean) return null;

        const lowered = clean.toLowerCase();
        const loweredName = pushName.toLowerCase();

        // Si ya empieza con el nombre del hablante ("Miguel..."), lo dejamos
        if (lowered.startsWith(loweredName)) {
          return clean;
        }

        // Si no menciona al usuario, prepende el nombre del hablante.
        // Esto es MUY importante en chats grupales.
        return `${pushName}: ${clean}`;
      })
      .filter(Boolean);

    // 4. Fallback inteligente si el modelo no metió cosas importantes en memory_fragments
    //
    // Vamos a detectar cosas que normalmente son "memoria útil" en el mensaje del usuario:
    // patrones tipo "llámame", "me llamo", "dime", "prefiero", "no me digas",
    // "voy a hacer", "yo hago", "yo soy el que", "yo me encargo",
    // "vamos a usar", "vamos a hacer deploy", "usaremos X", "me gusta", "odio".
    //
    const loweredUserText = userText.toLowerCase();
    const fallbackFragments = [];

    const patterns = [
      { match: /ll[aá]mame|dime|me llamo|soy ([a-z0-9_ -]{2,})/i, type: 'identidad/nombre' },
      { match: /no me digas|no me llames|no quiero que me digan/i, type: 'limite_apodo' },
      { match: /me gusta|amo|amo mucho|amo bastante|soy fan|me encanta|prefiero/i, type: 'gusto' },
      { match: /odio|detesto|no me gusta|no soporto/i, type: 'disgusto' },
      { match: /yo me encargo|yo lo hago|yo hago eso|yo voy a/i, type: 'responsabilidad' },
      { match: /voy a|vamos a|vamos hacer|vamos a usar|usaremos|usar[ ]+/, type: 'plan/tecnologia' },
      { match: /deploy|producción|produccion|prod|servidor|backend|base de datos|mariadb|fastapi|nginx|docker|api/i, type: 'stack' },
    ];

    for (const p of patterns) {
      if (p.match.test(userText)) {
        // creamos un fragmento genérico de fallback con el mensaje completo del usuario
        // siempre etiquetado con el nombre del que habló
        fallbackFragments.push(`${pushName}: ${userText}`);
        break; // con que matchee uno ya basta
      }
    }

    // combinamos las fragments del modelo con las fallback locales
    // evitando duplicados muy obvios
    const combinedSet = new Set([...(attributedFragments || []), ...fallbackFragments]);
    attributedFragments = Array.from(combinedSet);

    // 5. Guardar en memoria de trabajo
    const fullReply = botPayload.reply;
    const shortReply = fullReply.length > MAX_RESPONSE_CHARS
      ? fullReply.slice(0, MAX_RESPONSE_CHARS) + '…'
      : fullReply;

    const mem = db.users[chatId].memoria;
    mem.push({
      name: pushName,
      prompt: userText,
      response_full: fullReply,           // <- se usa para contexto en la siguiente ronda
      response_short: shortReply,         // <- solo para debug con "memorias"
      memory_fragments: attributedFragments,
      timestamp: Date.now()
    });

    // limitar memoria antes de resumir
    if (mem.length > MEMORY_LIMIT) {
      mem.splice(0, mem.length - MEMORY_LIMIT);
    }

    guardarDatabase(db);

    //
    // 6. ¿Toca resumir?
    //
    if (mem.length >= RESUME_TRIGGER) {
      // Partimos:
      // head = todo menos las últimas KEEP_RECENT interacciones
      // tail = últimas KEEP_RECENT interacciones (queremos mantenerlas vivas para no perder contexto inmediato)
      const head = mem.slice(0, Math.max(0, mem.length - KEEP_RECENT));
      const tail = mem.slice(-KEEP_RECENT);

      // De head sacamos solo fragmentos importantes (knowledge para largo plazo)
      const allFragments = head
        .flatMap(m => m.memory_fragments || [])
        .filter(x => x && typeof x === 'string' && x.trim() !== '');

      const rawSummaryInput = allFragments.length
        ? allFragments.map(f => `- ${f}`).join('\n')
        : '(no hubo fragmentos significativos)';

      try {
        // Prompt del resumen largo ultra factual:
        // - Nada de "en la conversación".
        // - Menciona nombres.
        // - Rol, gustos, límites, decisiones técnicas, planes.
        const resumenTexto = await callChatAPI({
          prompt: `
Eres el módulo de memoria a largo plazo de PandaBot.

Te voy a dar una lista de fragmentos importantes. Cada fragmento ya viene con
el nombre de la persona que lo dijo (por ejemplo "Miguel: ...").

Tu trabajo:
1. Une ideas repetidas o equivalentes.
2. Mantén claro a qué persona pertenece cada dato.
3. Conserva SOLO información útil en el futuro, como:
   - gustos personales y preferencias ("le gusta / prefiere / odia / no quiere que le digan X"),
   - decisiones técnicas concretas y quién las toma,
   - responsabilidades/roles ("X se encarga de Y"),
   - planes futuros claros y quién los va a hacer.

4. NO digas "en la conversación", "se habló", "platicamos". Cero narración. Solo hechos fríos.
5. Devuélveme TEXTO PLANO en dos partes:
   A) Un bloque de 3-5 frases que describa los hechos importantes actuales, mencionando nombres.
   B) Luego EXACTAMENTE 3 viñetas con hechos muy concretos, cada uno con nombre.

Fragmentos importantes:
${rawSummaryInput}
          `.trim(),
          system: `
Eres un sintetizador de memoria persistente de PandaBot.
Devuelve solo texto plano, directo, con nombres.
NO devuelvas JSON. NO metas relleno social.
`.trim()
        });

        // Guardamos el resumen largo en memoria histórica
        db.users[chatId].resumenes.push(resumenTexto);

        // Mantener contexto vivo de las últimas interacciones
        db.users[chatId].memoria = tail;
        guardarDatabase(db);

        await sock.sendMessage(from, {
          text: `🧩 Guardé info importante y mantuve el contexto reciente.`
        });

        //
        // 7. Meta-resumen cada cierto número de resúmenes
        //
        if (db.users[chatId].resumenes.length >= META_RESUME_TRIGGER) {
          const ultimosTres = db.users[chatId].resumenes.slice(-3).join('\n');

          const metaResumen = await callChatAPI({
            prompt: `
Eres el guardián de la memoria histórica de PandaBot.

Te voy a dar tres resúmenes previos. Cada uno ya está limpio y directo.
Quiero que los comprimas en un bloque único.

Reglas:
- Máximo 5 líneas en total.
- Mantén SOLO lo que todavía importa:
  • gustos personales duraderos ("X prefiere ..."),
  • límites personales ("X no quiere que le digan ..."),
  • stack/tecnología/infra que alguien decidió usar o mantener,
  • roles/autoridad ("X administra ...", "X se encarga de ..."),
  • planes que siguen activos.
- Siempre menciona los nombres ("Miguel ...", "Ana ...").
- Nada de narración tipo "ellos dijeron". Solo hechos.

Resúmenes previos:
${ultimosTres}
            `.trim(),
            system: `
Eres un sintetizador senior de memoria persistente de PandaBot.
Devuelve texto plano compacto. Nada de JSON.
`.trim()
          });

          // Reemplazar los 3 últimos resúmenes por el meta-resumen consolidado
          db.users[chatId].resumenes.splice(-3, 3, metaResumen);
          guardarDatabase(db);

          await sock.sendMessage(from, {
            text: '🧠 Compacté la memoria vieja en algo más sólido.'
          });
        }

      } catch (err) {
        console.error('Error generando resumen:', err);

        // fallback local si la API falló al resumir
        const participantes = [...new Set(mem.map(m => m.name))].slice(0, 5).join(', ');
        const fallback = `Memoria local provisional: participantes activos (${participantes}). Se detectó información importante pero no se pudo sintetizar ahora.`;
        db.users[chatId].resumenes.push(fallback);

        // igual mantenemos sólo las últimas KEEP_RECENT interacciones
        db.users[chatId].memoria = mem.slice(-KEEP_RECENT);
        guardarDatabase(db);

        await sock.sendMessage(from, {
          text: '⚠️ No pude sintetizar memoria externa ahora, pero guardé algo local.'
        });
      }
    }

    //
    // 8. Mandar la respuesta final que PandaBot le diría al usuario/grupo
    //
    await sock.sendMessage(from, { text: botPayload.reply });

  } catch (err) {
    console.error('Error en petición al endpoint:', err);
    return sock.sendMessage(from, {
      text: '🚨 Ocurrió un error interno al procesar la solicitud con PandaBot.'
    });
  }
}
