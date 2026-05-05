/**
 * KYOSEI ACCESIBILIDAD — qr-app.js
 * Lógica para el generador de códigos QR con soporte para WhatsApp
 */

document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('nombre');
    const textoInput = document.getElementById('texto');
    const btnGenerar = document.getElementById('btn-generar');
    const btnDescargar = document.getElementById('btn-descargar');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const canvas = document.getElementById('qrcode');
    const mensajeEstado = document.getElementById('mensaje-estado');
    const radiosColor = document.querySelectorAll('input[name="color"]');
    const textoColorSeleccionado = document.getElementById('color-anuncio');

    /**
     * Función de ayuda para accesibilidad (aria-disabled)
     */
    function toggleButtonState(btn, isDisabled) {
        btn.disabled = isDisabled;
        btn.setAttribute('aria-disabled', isDisabled.toString());
    }

    /**
     * Valida que los campos no estén vacíos antes de permitir generar
     */
    function validarCampos() {
        const nombreValido = nombreInput.value.trim() !== '';
        const textoValido = textoInput.value.trim() !== '';
        toggleButtonState(btnGenerar, !(nombreValido && textoValido));
    }

    nombreInput.addEventListener('input', validarCampos);
    textoInput.addEventListener('input', validarCampos);

    /**
     * Generación del QR
     */
    btnGenerar.addEventListener('click', () => {
        let contenido = textoInput.value.trim();
        const colorInput = document.querySelector('input[name="color"]:checked');
        const color = colorInput ? colorInput.value : '#000000';

        // Lógica de WhatsApp: Si el usuario ingresa solo números, lo convertimos a link de WA
        // Esto hace que la herramienta sea más "inteligente"
        const soloNumeros = /^\d+$/.test(contenido.replace(/\+/g, ''));
        if (soloNumeros) {
            // Eliminamos espacios o signos de más para el link limpio
            const numLimpio = contenido.replace(/\D/g, '');
            contenido = `https://wa.me/${numLimpio}`;
        }

        if (!contenido) return;

        // Limpiar canvas previo
        const contexto = canvas.getContext('2d');
        contexto.clearRect(0, 0, canvas.width, canvas.height);

        QRCode.toCanvas(canvas, contenido, {
            color: {
                dark: color,
                light: '#ffffff'
            },
            width: 250,
            margin: 2
        })
        .then(() => {
            toggleButtonState(btnDescargar, false);
            canvas.setAttribute('aria-label', `Código QR generado con éxito para: ${nombreInput.value}`);
            
            // Usar la función de anuncios de main.js si está disponible
            if (typeof anunciar === 'function') {
                anunciar('¡Código QR generado con éxito!');
            }
        })
        .catch(err => {
            console.error("Error QR:", err);
            if (typeof anunciar === 'function') anunciar('Hubo un error al generar el código.', 'assertive');
        });
    });

    /**
     * Cambio de colores con anuncio para lectores de pantalla
     */
    radiosColor.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const nombreColor = e.target.getAttribute('data-nombre-color');
            textoColorSeleccionado.innerHTML = `Color seleccionado: <strong>${nombreColor}</strong>`;
        });
    });

    /**
     * Descarga del archivo
     */
    btnDescargar.addEventListener('click', () => {
        const enlace = document.createElement('a');
        const nombreArchivo = nombreInput.value.trim().replace(/\s+/g, '-').toLowerCase() || 'codigo-qr';
        enlace.href = canvas.toDataURL('image/png');
        enlace.download = `kyosei-qr-${nombreArchivo}.png`;
        enlace.click();
    });

    /**
     * Reiniciar herramienta
     */
    btnReiniciar.addEventListener('click', () => {
        nombreInput.value = '';
        textoInput.value = '';
        document.getElementById('color-negro').checked = true;
        textoColorSeleccionado.innerHTML = `Color seleccionado: <strong>Negro clásico</strong>`;

        const contexto = canvas.getContext('2d');
        contexto.clearRect(0, 0, canvas.width, canvas.height);
        
        toggleButtonState(btnGenerar, true);
        toggleButtonState(btnDescargar, true);
        nombreInput.focus();
    });
});