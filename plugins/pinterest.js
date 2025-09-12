import axios from 'axios';

export const command = 'pinterest'; // El comando principal
// Si quieres alias, puedes definirlos aquí, por ejemplo:
// export const aliases = ['pinterestsearch', 'pin'];

export async function run(sock, msg, args) {
    const from = msg.key.remoteJid; // El JID del chat desde donde se envió el mensaje
    // Reconstruye el texto de búsqueda de los argumentos.
    // Si el comando fuera "!pinterest gatos bonitos", args sería ["gatos", "bonitos"].
    // .join(' ') los une en "gatos bonitos".
    const text = args.join(' ');

    try {
        // --- 1. Validación de entrada ---
        if (!text) {
            await sock.sendMessage(from, { text: '🚩 Por favor, proporciona un término de búsqueda para Pinterest. Ejemplo: `!pinterest gatos bonitos`' }, { quoted: msg });
            return;
        }

        // --- 2. Reacción de procesamiento ---
        await sock.sendMessage(from, { react: { text: '🕓', key: msg.key } });

        // --- 3. Llamada a la API de Pinterest ---
        const response = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
        const data = response.data.data;

        // --- 4. Verificación de resultados ---
        if (!data || data.length === 0) {
            await sock.sendMessage(from, { text: `❌ No se encontraron imágenes para "${text}" en Pinterest.` }, { quoted: msg });
            await sock.sendMessage(from, { react: { text: '✖️', key: msg.key } }); // Reacción de error
            return;
        }

        // --- 5. Selección y preparación de la imagen ---
        const randomImage = data[Math.floor(Math.random() * data.length)];
        const imageUrl = randomImage.images_url;
        const title = randomImage.grid_title || `¡Aquí tienes una imagen de ${text}!`;

        // Si usas una variable global como `global.dev`, asegúrate de que exista.
        // Adaptación para tu `global.dev` si lo tienes. Si no, simplemente quítalo o déjalo vacío.
        const globalDevText = typeof global !== 'undefined' && global.dev ? global.dev : '';

        // --- 6. Envío de la imagen con botón ---
        await sock.sendMessage(
            from,
            {
                image: { url: imageUrl },
                caption: `\t\t🚩 *${title}*\n ${globalDevText}`,
                buttons: [
                    {
                        buttonId: `.pinterest ${text}`, // El comando a ejecutar al presionar el botón (mismo comando para otra búsqueda)
                        buttonText: { displayText: 'Siguiente 🔍' },
                        type: 1 // Tipo 1 para un botón de respuesta rápida
                    }
                ],
                headerType: 4 // Tipo de cabecera para mensajes con imagen
            },
            { quoted: msg } // Cita el mensaje original del usuario
        );

        // --- 7. Reacción de éxito ---
        await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });

    } catch (error) {
        // --- 8. Manejo de errores ---
        console.error('Error al obtener la imagen de Pinterest:', error);
        await sock.sendMessage(from, { react: { text: '✖️', key: msg.key } }); // Reacción de error
        await sock.sendMessage(from, { text: '❌ Ocurrió un error al intentar obtener la imagen de Pinterest. Inténtalo nuevamente.' }, { quoted: msg });
    }
}

