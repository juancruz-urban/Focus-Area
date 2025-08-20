// Inserta una hoja de estilos global (una sola vez) que aplica el zoom
export function ensurePageZoomCSS() {
  const STYLE_ID = "__fa_zoom_css__";
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    :root { --fa-zoom: 1; }

    /* No tocar html/body para no romper position:fixed */
    html, body { transform: none !important; }

    /* Escalamos TODO lo que cuelga de body EXCEPTO el contenedor de la extensión */
    body > :not(#container-area) {
      transform: scale(var(--fa-zoom)) !important;
      transform-origin: 0 0 !important;
      /* Compensación de ancho para que la página siga ocupando el viewport */
      width: calc(100% / var(--fa-zoom));
      /* Evita clipping en algunos layouts con height 100vh */
      min-height: calc(100vh / var(--fa-zoom));
    }

    /* Aseguramos que el overlay no herede transform y quede arriba */
    #container-area {
      transform: none !important;
      position: fixed !important;
      inset: 0 !important;
      pointer-events: none !important;
      z-index: 2147483647 !important;
    }
  `;
  document.head.appendChild(style);
}
