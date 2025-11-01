export const command = 'reglascarioca';

export async function run(sock, msg) {
    const from = msg.key.remoteJid;
    const rulesText = `
*🃏 REGLAS BÁSICAS DE CARIOCA (CHILENA) 🇨🇱*
El objetivo es sumar la menor cantidad de puntos a lo largo de 10 rondas.

*1. Cartas y Puntos:*
- Se usan 2 mazos (108 cartas) con 4 Comodines (Jokers).
- Cartas 2-10: Su valor nominal.
- J, Q, K: 10 puntos.
- As (A): 20 puntos.
- Comodín (Joker): 30 puntos.

*2. Rondas y Contratos (Juegos a "Bajar"):*
Cada ronda exige una combinación mínima de cartas para poder "bajar".

| Ronda | Contrato | Cartas |
| :---: | :--- | :--- |
| 1 | 2 Tríos | 6 |
| 2 | 1 Trío + 1 Escala | 7 |
| 3 | 2 Escalas | 8 |
| 4 | 3 Tríos | 9 |
| 5 | 2 Tríos + 1 Escala | 10 |
| 6 | 1 Trío + 2 Escalas | 11 |
| 7 | 3 Escalas | 12 |
| 8 | 4 Tríos | 12 |
| 9 | Escalera Sucia (A-K) | 13 |
| 10 | Escalera Real (A-K, misma pinta) | 13 |

*3. Combinaciones:*
- **Trío:** 3 cartas del mismo número, pinta no importa.
- **Escala:** 4 cartas consecutivas de la *misma pinta*.
- **Comodines:** Reemplazan cualquier carta. Solo un Comodín por Trío/Escala.

*4. Desarrollo:*
1. Robar del mazo o del pozo.
2. Si cumples el contrato, "bajar" tus juegos.
3. Si ya bajaste, "lanzar" cartas a juegos propios o de otros.
4. Finalizar tu turno botando una carta al pozo.
5. Gana el que se queda sin cartas (y los demás suman puntos).

*Comandos para Jugar (en mi chat privado):*
- \`.jugada recoger mazo\` o \`.jugada recoger pozo\`
- \`.jugada descartar <Carta_a_botar>\`
- \`.jugada bajartodo\`
- \`.jugada lanzar <ID_JUGADOR> <Cartas_a_lanzar>\`
    `;
    
    await sock.sendMessage(from, { text: rulesText }, { quoted: msg });
}

