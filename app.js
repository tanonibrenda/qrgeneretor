document.addEventListener('DOMContentLoaded', () => {
    const nombreInput = document.getElementById('nombre');
    const textoInput = document.getElementById('texto');
    const btnGenerar = document.getElementById('btn-generar');
    const btnDescargar = document.getElementById('btn-descargar');
    const btnReiniciar = document.getElementById('btn-reiniciar');
    const canvas = document.getElementById('qrcode');
    const mensajeEstado = document.getElementById('mensaje-estado');

    // Función de ayuda para accesibilidad
    function toggleButtonState(btn, isDisabled) {
        btn.disabled = isDisabled;
        btn.setAttribute('aria-disabled', isDisabled.toString());
    }

    function validarCampos() {
        const nombreValido = nombreInput.value.trim() !== '';
        const textoValido = textoInput.value.trim() !== '';
        toggleButtonState(btnGenerar, !(nombreValido && textoValido));
    }

    nombreInput.addEventListener('input', validarCampos);
    textoInput.addEventListener('input', validarCampos);

    btnGenerar.addEventListener('click', () => {
        const texto = textoInput.value.trim();
        const colorInput = document.querySelector('input[name="color"]:checked');
        const color = colorInput ? colorInput.value : '#000000';

        if (!texto) return;

        // Usamos la API basada en promesas de qrcode.js para capturar errores correctamente
        QRCode.toCanvas(canvas, texto, {
            color: {
                dark: color,
                light: '#ffffff'
            },
            width: 200,
            margin: 1
        })
        .then(() => {
            toggleButtonState(btnDescargar, false);
            canvas.setAttribute('aria-label', `Código QR generado para: ${nombreInput.value}`);
            // Anuncio para el lector de pantalla sin cambiar el texto visual
            const anuncio = document.createElement('span');
            anuncio.className = 'sr-only';
            anuncio.textContent = '¡Código QR generado con éxito!';
            mensajeEstado.appendChild(anuncio);
        })
        .catch(err => {
            console.error("Error al generar el QR:", err);
            mensajeEstado.textContent = "Error al generar. Intenta de nuevo.";
        });
    });

   
    // --- NUEVO: Lógica de Accesibilidad para Colores ---
    const radiosColor = document.querySelectorAll('input[name="color"]');
    const textoColorSeleccionado = document.getElementById('color-anuncio');

    radiosColor.forEach(radio => {
        radio.addEventListener('change', (e) => {
            // Extraemos el nombre en español que pusimos en el HTML
            const nombreColor = e.target.getAttribute('data-nombre-color');
            
            // Actualizamos el texto visible (el atributo aria-live hará que el lector lo dicte al instante)
            textoColorSeleccionado.innerHTML = `Color seleccionado: <strong>${nombreColor}</strong>`;
        });
    });
    // --------------------------------------------------

   

    btnDescargar.addEventListener('click', () => {
        const enlace = document.createElement('a');
        const nombreQR = nombreInput.value.trim() || 'codigoQR';
        enlace.href = canvas.toDataURL('image/png');
        enlace.download = `${nombreQR}.png`;
        enlace.click();
    });

    btnReiniciar.addEventListener('click', () => {
        nombreInput.value = '';
        textoInput.value = '';
        document.querySelector('input[name="color"][value="#000000"]').checked = true;

        const contexto = canvas.getContext('2d');
        contexto.clearRect(0, 0, canvas.width, canvas.height);
        canvas.setAttribute('aria-label', 'Código QR en blanco');

        toggleButtonState(btnGenerar, true);
        toggleButtonState(btnDescargar, true);
        
        // Limpiamos los anuncios para lectores de pantalla
        const srAnuncio = mensajeEstado.querySelector('.sr-only');
        if (srAnuncio) srAnuncio.remove();
        
        mensajeEstado.textContent = "Escanéame";
        nombreInput.focus();
    });
});