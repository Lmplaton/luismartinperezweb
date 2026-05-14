/* Tweaks panel — vanilla JS, no React dependency
   Controls: direction (editorial/brutalist/gallery), accent, dark mode.
   Persists via LMP (localStorage) + posts __edit_mode_set_keys for host. */
(function () {
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "direction": "editorial",
    "accent": "ochre",
    "highlight": "red",
    "theme": "light"
  }/*EDITMODE-END*/;

  let panel = null;
  let active = false;

  function send(type, payload) {
    try { window.parent.postMessage(Object.assign({ type }, payload || {}), "*"); } catch (e) {}
  }

  function applyAll(state) {
    if (state.direction) window.LMP.setDirection(state.direction);
    if (state.accent) window.LMP.setAccent(state.accent);
    if (state.highlight) window.LMP.setHighlight(state.highlight);
    if (state.theme) window.LMP.setTheme(state.theme);
  }

  function currentState() {
    return {
      direction: window.LMP.getDirection(),
      accent: window.LMP.getAccent(),
      highlight: window.LMP.getHighlight(),
      theme: window.LMP.getTheme(),
    };
  }

  function buildPanel() {
    const el = document.createElement("aside");
    el.className = "tweaks-panel";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Tweaks");
    el.innerHTML = `
      <header class="tw-head">
        <span class="tw-title">Tweaks</span>
        <button class="tw-close" aria-label="Cerrar Tweaks">×</button>
      </header>
      <div class="tw-body">

        <section class="tw-section">
          <h4>Dirección visual</h4>
          <div class="tw-grid" data-key="direction">
            <button data-val="editorial">Editorial</button>
            <button data-val="brutalist">Brutalista</button>
            <button data-val="gallery">Galería</button>
            <button data-val="manuscript">Manuscrito</button>
            <button data-val="magazine">Revista</button>
          </div>
          <p class="tw-hint">Cambia ritmo, contraste y peso tipográfico.</p>
        </section>

        <section class="tw-section">
          <h4>Acento <small>UI &middot; enlaces</small></h4>
          <div class="tw-swatches" data-key="accent">
            <button data-val="ochre" style="--c:#a06a3a" aria-label="Ocre"></button>
            <button data-val="rust"  style="--c:#b04a2c" aria-label="Rojo tierra"></button>
            <button data-val="sage"  style="--c:#6c7e5e" aria-label="Salvia"></button>
            <button data-val="ink"   style="--c:#15140f" aria-label="Tinta"></button>
          </div>
        </section>

        <section class="tw-section">
          <h4>Destacado <small>cursivas en titulares</small></h4>
          <div class="tw-swatches" data-key="highlight">
            <button data-val="red"    style="--c:#a8331f" aria-label="Rojo editorial"></button>
            <button data-val="blue"   style="--c:#2a4a78" aria-label="Azul tinta"></button>
            <button data-val="plum"   style="--c:#6b2447" aria-label="Ciruela"></button>
            <button data-val="forest" style="--c:#2f5a3c" aria-label="Verde bosque"></button>
          </div>
        </section>

        <section class="tw-section">
          <h4>Modo</h4>
          <div class="tw-radio" data-key="theme">
            <button data-val="light">Claro</button>
            <button data-val="dark">Oscuro</button>
          </div>
        </section>

        <footer class="tw-foot">
          <span class="mono">Las preferencias se guardan localmente.</span>
        </footer>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  function syncSelections() {
    if (!panel) return;
    const st = currentState();
    panel.querySelectorAll(".tw-radio, .tw-grid, .tw-swatches").forEach(g => {
      const key = g.dataset.key;
      g.querySelectorAll("button").forEach(b => {
        b.classList.toggle("on", b.dataset.val === st[key]);
      });
    });
  }

  function wire() {
    panel.querySelector(".tw-close").addEventListener("click", () => {
      hide();
      send("__edit_mode_dismissed");
    });
    panel.querySelectorAll(".tw-radio, .tw-grid, .tw-swatches").forEach(g => {
      const key = g.dataset.key;
      g.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-val]");
        if (!btn) return;
        const val = btn.dataset.val;
        const patch = { [key]: val };
        applyAll(patch);
        syncSelections();
        send("__edit_mode_set_keys", { edits: patch });
      });
    });
  }

  function show() {
    if (!panel) {
      panel = buildPanel();
      wire();
    }
    panel.classList.add("on");
    syncSelections();
    active = true;
  }
  function hide() {
    if (panel) panel.classList.remove("on");
    active = false;
  }

  // Apply persisted defaults (LMP already does this on initial load, but ensure
  // the in-page TWEAK_DEFAULTS take effect when no localStorage value exists).
  document.addEventListener("DOMContentLoaded", () => {
    const init = currentState();
    // If LMP defaulted to ochre/editorial/light but the TWEAK_DEFAULTS differs,
    // prefer TWEAK_DEFAULTS only if there's no localStorage value.
    try {
      if (!localStorage.getItem("lmp.direction")) window.LMP.setDirection(TWEAK_DEFAULTS.direction);
      if (!localStorage.getItem("lmp.accent")) window.LMP.setAccent(TWEAK_DEFAULTS.accent);
      if (!localStorage.getItem("lmp.highlight")) window.LMP.setHighlight(TWEAK_DEFAULTS.highlight);
      if (!localStorage.getItem("lmp.theme")) window.LMP.setTheme(TWEAK_DEFAULTS.theme);
    } catch (e) {}
  });

  window.addEventListener("message", (e) => {
    const t = e.data && e.data.type;
    if (t === "__activate_edit_mode") show();
    if (t === "__deactivate_edit_mode") hide();
  });

  send("__edit_mode_available");
})();
