/* Shared site behavior: theme + accent + direction persistence, nav, reveals */
(function () {
  const root = document.documentElement;
  const KEY_THEME = "lmp.theme";
  const KEY_ACCENT = "lmp.accent";
  const KEY_DIR = "lmp.direction";
  const KEY_HL = "lmp.highlight";

  // Apply persisted values BEFORE paint to avoid flash
  try {
    const t = localStorage.getItem(KEY_THEME);
    const a = localStorage.getItem(KEY_ACCENT);
    const d = localStorage.getItem(KEY_DIR);
    const h = localStorage.getItem(KEY_HL);
    if (t) root.setAttribute("data-theme", t);
    else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
    if (a) root.setAttribute("data-accent", a);
    else root.setAttribute("data-accent", "ochre");
    if (d) root.setAttribute("data-direction", d);
    else root.setAttribute("data-direction", "editorial");
    if (h) root.setAttribute("data-highlight", h);
    else root.setAttribute("data-highlight", "red");
  } catch (e) { /* no-op */ }

  // Expose setters for tweaks panel + theme toggle
  window.LMP = {
    setTheme(v) {
      root.setAttribute("data-theme", v);
      try { localStorage.setItem(KEY_THEME, v); } catch (e) {}
      updateThemeIcon();
    },
    toggleTheme() {
      const cur = root.getAttribute("data-theme") || "light";
      this.setTheme(cur === "dark" ? "light" : "dark");
    },
    setAccent(v) {
      root.setAttribute("data-accent", v);
      try { localStorage.setItem(KEY_ACCENT, v); } catch (e) {}
    },
    setDirection(v) {
      root.setAttribute("data-direction", v);
      try { localStorage.setItem(KEY_DIR, v); } catch (e) {}
    },
    setHighlight(v) {
      root.setAttribute("data-highlight", v);
      try { localStorage.setItem(KEY_HL, v); } catch (e) {}
    },
    getTheme() { return root.getAttribute("data-theme") || "light"; },
    getAccent() { return root.getAttribute("data-accent") || "ochre"; },
    getDirection() { return root.getAttribute("data-direction") || "editorial"; },
    getHighlight() { return root.getAttribute("data-highlight") || "red"; },
  };

  function updateThemeIcon() {
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    const isDark = (root.getAttribute("data-theme") === "dark");
    btn.setAttribute("aria-label", isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
    btn.innerHTML = isDark
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateThemeIcon();

    // Theme toggle wiring
    const tt = document.querySelector(".theme-toggle");
    if (tt) tt.addEventListener("click", () => window.LMP.toggleTheme());

    // Mobile nav toggle
    const mt = document.querySelector(".mobile-toggle");
    const header = document.querySelector(".site-header");
    if (mt && header) {
      mt.addEventListener("click", () => header.classList.toggle("open"));
    }

    // Mark active nav link by pathname
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav a").forEach(a => {
      const href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });

    // Reveal on scroll — IntersectionObserver
    const reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      reveals.forEach(el => io.observe(el));
    } else {
      reveals.forEach(el => el.classList.add("in"));
    }

    // ─── Magnetic sliding nav indicator (Apple-style) ─────────────────
    const navEl = document.querySelector(".nav");
    const headerEl = document.querySelector(".site-header");
    if (navEl) {
      const indicator = document.createElement("span");
      indicator.className = "nav-indicator";
      navEl.appendChild(indicator);
      const links = navEl.querySelectorAll("a");
      let activeLink = navEl.querySelector('[aria-current="page"]') || links[0];

      function moveTo(target, instant) {
        if (!target || window.innerWidth < 781) {
          indicator.style.opacity = "0";
          return;
        }
        const r = target.getBoundingClientRect();
        const navR = navEl.getBoundingClientRect();
        if (instant) indicator.style.transition = "none";
        indicator.style.opacity = "1";
        indicator.style.width = r.width + "px";
        indicator.style.transform = `translateX(${r.left - navR.left}px)`;
        if (instant) {
          // Force reflow, then restore transition next frame
          indicator.offsetHeight;
          requestAnimationFrame(() => { indicator.style.transition = ""; });
        }
      }

      // Initial position
      requestAnimationFrame(() => moveTo(activeLink, true));

      links.forEach(a => {
        a.addEventListener("mouseenter", () => {
          navEl.classList.add("is-hover");
          moveTo(a);
        });
        a.addEventListener("focus", () => {
          navEl.classList.add("is-hover");
          moveTo(a);
        });
      });
      navEl.addEventListener("mouseleave", () => {
        navEl.classList.remove("is-hover");
        moveTo(activeLink);
      });
      navEl.addEventListener("focusout", (e) => {
        if (!navEl.contains(e.relatedTarget)) {
          navEl.classList.remove("is-hover");
          moveTo(activeLink);
        }
      });
      window.addEventListener("resize", () => moveTo(activeLink, true));
    }

    // ─── Header scrolled state + scroll progress bar ──────────────────
    if (headerEl) {
      const progress = document.createElement("span");
      progress.className = "scroll-progress";
      headerEl.appendChild(progress);

      let ticking = false;
      const update = () => {
        const s = window.scrollY;
        headerEl.toggleAttribute("data-scrolled", s > 20);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(1, Math.max(0, s / max)) : 0;
        progress.style.transform = `scaleX(${pct})`;
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (!ticking) {
          requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
      update();
    }

    // Animate mediation links — sequential glow
    const mediation = document.querySelector(".mediation svg");
    if (mediation) {
      const links = mediation.querySelectorAll(".link");
      let i = 0;
      setInterval(() => {
        links.forEach(l => l.classList.remove("active"));
        const pick = links[i % links.length];
        if (pick) pick.classList.add("active");
        i++;
      }, 1400);
    }
  });
})();
