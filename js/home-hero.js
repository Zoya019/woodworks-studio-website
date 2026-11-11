/**
 * Wood Works Studio – home hero interactions
 * - Entrance fade-up
 * - Featured projects slider (autoplay, arrows, dots, swipe, keyboard)
 * - Sticky header after the hero
 * - Full-screen menu
 * - Scroll reveal for "We will create for you" lines
 * - Service words pre-select the service in the enquiry form
 */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Entrance ----------
  function playEntrance() {
    requestAnimationFrame(() => document.documentElement.classList.add("wh-ready"));
  }

  // ---------- Slider ----------
  function setupSlider() {
    const root = document.querySelector("[data-wh-slider]");
    if (!root) return;
    const slides = [...root.querySelectorAll(".wh-slide")];
    const thumbs = [...root.querySelectorAll(".wh-thumbs img")];
    const thumbLink = root.querySelector(".wh-thumbs");
    const count = root.querySelector(".wh-count");
    const progress = root.querySelector(".wh-progress");
    const dotsWrap = root.querySelector(".wh-dots-row");
    const DURATION = 6000;
    let index = 0;
    let timer = null;
    let hovering = false;

    const dots = slides.map((s, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show project " + (i + 1));
      b.addEventListener("click", () => go(i, true));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function pad(n) { return String(n).padStart(2, "0"); }

    function render() {
      slides.forEach((s, i) => {
        const on = i === index;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
        s.querySelectorAll("a").forEach((a) => (a.tabIndex = on ? 0 : -1));
      });
      thumbs.forEach((t, i) => t.classList.toggle("is-active", i === index));
      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      if (count) count.textContent = pad(index + 1) + " / " + pad(slides.length);
      if (thumbLink) {
        const href = slides[index].querySelector(".wh-slide-link");
        if (href) {
          thumbLink.href = href.getAttribute("href");
          thumbLink.setAttribute("aria-label", "Open " + slides[index].querySelector(".wh-slide-name").textContent);
        }
      }
      restartProgress();
    }

    function restartProgress() {
      if (!progress || reduceMotion) return;
      progress.classList.remove("is-running");
      void progress.offsetWidth; // restart CSS animation
      progress.style.setProperty("--wh-dur", DURATION + "ms");
      progress.classList.add("is-running");
    }

    function go(i, user) {
      index = (i + slides.length) % slides.length;
      render();
      if (user) schedule();
    }

    function schedule() {
      clearTimeout(timer);
      if (reduceMotion) return;
      timer = setTimeout(function tick() {
        if (!hovering && !document.hidden) go(index + 1);
        else restartProgress();
        timer = setTimeout(tick, DURATION);
      }, DURATION);
    }

    root.querySelector("[data-prev]").addEventListener("click", () => go(index - 1, true));
    root.querySelector("[data-next]").addEventListener("click", () => go(index + 1, true));
    root.addEventListener("mouseenter", () => (hovering = true));
    root.addEventListener("mouseleave", () => (hovering = false));
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(index - 1, true);
      if (e.key === "ArrowRight") go(index + 1, true);
    });

    // Swipe / drag
    let startX = null, startY = null, dragged = false;
    root.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      startX = e.clientX; startY = e.clientY; dragged = false;
    });
    root.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        dragged = true;
        go(index + (dx < 0 ? 1 : -1), true);
      }
      startX = null;
    });
    root.addEventListener("click", (e) => {
      if (dragged) { e.preventDefault(); dragged = false; }
    }, true);

    render();
    schedule();
  }

  // ---------- Sticky header ----------
  function setupSticky() {
    const hero = document.querySelector(".wh-hero");
    const bar = document.querySelector(".wh-sticky");
    if (!hero || !bar || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      bar.classList.toggle("is-on", !entry.isIntersecting);
    }, { rootMargin: "-120px 0px 0px 0px", threshold: 0 });
    io.observe(hero);
  }

  // ---------- Menu ----------
  function setupMenu() {
    const menu = document.querySelector(".wh-menu");
    if (!menu) return;
    const openers = document.querySelectorAll("[data-wh-menu]");
    const close = menu.querySelector(".wh-menu-close");
    let last = null;
    function open() {
      last = document.activeElement;
      menu.classList.add("is-open");
      menu.setAttribute("aria-hidden", "false");
      document.documentElement.style.overflow = "hidden";
      setTimeout(() => close.focus(), 50);
    }
    function shut() {
      menu.classList.remove("is-open");
      menu.setAttribute("aria-hidden", "true");
      document.documentElement.style.overflow = "";
      if (last) last.focus();
    }
    openers.forEach((b) => b.addEventListener("click", open));
    close.addEventListener("click", shut);
    menu.querySelectorAll("nav a, .wh-menu-foot a").forEach((a) => a.addEventListener("click", shut));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("is-open")) shut(); });
  }

  // ---------- Scroll reveal ----------
  function setupReveal() {
    const items = document.querySelectorAll(".wh-create .wh-in");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    items.forEach((el) => io.observe(el));
  }

  // ---------- Service words -> enquiry form ----------
  function setupServiceLinks() {
    document.querySelectorAll("[data-service]").forEach((a) => {
      a.addEventListener("click", () => {
        const val = a.getAttribute("data-service");
        const input = [...document.querySelectorAll('#lead-form input[name="service"]')].find((i) => i.value === val);
        if (input) input.checked = true;
        if (window.WWS_LEADS) window.WWS_LEADS.track("service_word_click", val);
      });
    });
  }

  function init() {
    setupSlider();
    setupSticky();
    setupMenu();
    setupReveal();
    setupServiceLinks();
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(playEntrance);
    } else playEntrance();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
