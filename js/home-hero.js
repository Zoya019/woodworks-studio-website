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
  document.documentElement.classList.add("wh-js");

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
      b.addEventListener("click", () => go(i, true, i > index ? 1 : -1));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });

    function pad(n) { return String(n).padStart(2, "0"); }

    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

    function render(prev, dir) {
      slides.forEach((s, i) => {
        const on = i === index;
        s.classList.toggle("is-active", on);
        s.setAttribute("aria-hidden", on ? "false" : "true");
        s.querySelectorAll("a").forEach((a) => (a.tabIndex = on ? 0 : -1));
      });
      thumbs.forEach((t, i) => {
        t.classList.toggle("is-active", i === index);
        t.style.zIndex = i === index ? 2 : i === prev ? 1 : 0;
        t.style.opacity = i === index || i === prev ? 1 : 0;
      });
      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      if (count) count.textContent = pad(index + 1) + " / " + pad(slides.length);
      if (thumbLink) {
        const href = slides[index].querySelector(".wh-slide-link");
        if (href) {
          thumbLink.href = href.getAttribute("href");
          thumbLink.setAttribute("aria-label", "Open " + slides[index].querySelector(".wh-slide-name").textContent);
        }
      }
      if (prev !== undefined && prev !== index && !reduceMotion && Element.prototype.animate) {
        animateSlide(prev, index, dir);
      } else {
        thumbs.forEach((t, i) => (t.style.opacity = i === index ? 1 : 0));
      }
      restartProgress();
    }

    // Slide-change animation: text and photo move in the arrow's direction
    function animateSlide(from, to, dir) {
      const out = slides[from], inn = slides[to];
      out.getAnimations().forEach((a) => a.cancel());
      inn.getAnimations().forEach((a) => a.cancel());
      out.style.opacity = 1;
      out.animate(
        [{ transform: "translateX(0)", opacity: 1 }, { transform: "translateX(" + -dir * 48 + "px)", opacity: 0 }],
        { duration: 450, easing: EASE, fill: "forwards" }
      ).onfinish = () => { out.style.opacity = ""; out.getAnimations().forEach((a) => a.cancel()); };
      inn.animate(
        [{ transform: "translateX(" + dir * 48 + "px)", opacity: 0 }, { transform: "translateX(0)", opacity: 1 }],
        { duration: 650, delay: 120, easing: EASE, fill: "backwards" }
      );

      const tOut = thumbs[from], tIn = thumbs[to];
      [tOut, tIn].forEach((t) => t.getAnimations().forEach((a) => a.cancel()));
      tIn.animate(
        [
          { clipPath: dir > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)", transform: "translateX(" + dir * 12 + "%) scale(1.08)" },
          { clipPath: "inset(0 0 0 0)", transform: "translateX(0) scale(1)" }
        ],
        { duration: 800, easing: EASE }
      );
      tOut.animate(
        [{ transform: "translateX(0)" }, { transform: "translateX(" + -dir * 30 + "%)" }],
        { duration: 800, easing: EASE, fill: "forwards" }
      ).onfinish = () => {
        tOut.getAnimations().forEach((a) => a.cancel());
        if (!tOut.classList.contains("is-active")) tOut.style.opacity = 0;
      };
    }

    function restartProgress() {
      if (!progress || reduceMotion) return;
      progress.classList.remove("is-running");
      void progress.offsetWidth; // restart CSS animation
      progress.style.setProperty("--wh-dur", DURATION + "ms");
      progress.classList.add("is-running");
    }

    function go(i, user, dirHint) {
      const prev = index;
      const next = (i + slides.length) % slides.length;
      if (next === prev) return;
      const dir = dirHint || (i > prev ? 1 : -1);
      index = next;
      render(prev, dir);
      if (user) schedule();
    }

    function schedule() {
      clearTimeout(timer);
      if (reduceMotion) return;
      timer = setTimeout(function tick() {
        if (!hovering && !document.hidden) go(index + 1, false, 1);
        else restartProgress();
        timer = setTimeout(tick, DURATION);
      }, DURATION);
    }

    root.querySelector("[data-prev]").addEventListener("click", () => go(index - 1, true, -1));
    root.querySelector("[data-next]").addEventListener("click", () => go(index + 1, true, 1));
    root.addEventListener("mouseenter", () => (hovering = true));
    root.addEventListener("mouseleave", () => (hovering = false));
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(index - 1, true, -1);
      if (e.key === "ArrowRight") go(index + 1, true, 1);
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
        go(index + (dx < 0 ? 1 : -1), true, dx < 0 ? 1 : -1);
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

  // Portfolio panels: content is fixed, so bring a panel into view when
  // keyboard focus lands inside it
  function setupPanels() {
    const panels = document.querySelectorAll(".wh-panel");
    // Build a panel's fixed layer only while its block is on (or next to) the
    // screen. Off-screen fixed full-viewport layers cost GPU memory for nothing.
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => e.target.classList.toggle("is-live", e.isIntersecting));
      }, { rootMargin: "60px 0px" });
      panels.forEach((p) => io.observe(p));
    } else {
      panels.forEach((p) => p.classList.add("is-live"));
    }
    panels.forEach((panel) => {
      panel.addEventListener("focusin", () => {
        const r = panel.getBoundingClientRect();
        if (Math.abs(r.top) > 4) window.scrollTo({ top: window.scrollY + r.top, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  // ---------- Team: hover/tap a portrait to open their story ----------
  function setupTeam() {
    const section = document.querySelector(".wh-team");
    if (!section) return;
    const stage = section.querySelector(".wh-team-stage");
    const tiles = [...section.querySelectorAll(".wh-member")];
    const bios = [...section.querySelectorAll(".wh-bio")];
    let current = null;
    let closeTimer = null;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    function open(id) {
      clearTimeout(closeTimer);
      if (current === id) return;
      current = id;
      tiles.forEach((t) => {
        const on = t.dataset.person === id;
        t.classList.toggle("is-open", on);
        t.setAttribute("aria-expanded", on ? "true" : "false");
      });
      bios.forEach((b) => {
        const on = b.dataset.person === id;
        b.classList.toggle("is-open", on);
        b.setAttribute("aria-hidden", on ? "false" : "true");
      });
      stage.classList.add("has-open");
      section.classList.add("has-open");
    }
    function close() {
      clearTimeout(closeTimer);
      current = null;
      tiles.forEach((t) => { t.classList.remove("is-open"); t.setAttribute("aria-expanded", "false"); });
      bios.forEach((b) => { b.classList.remove("is-open"); b.setAttribute("aria-hidden", "true"); });
      stage.classList.remove("has-open");
      section.classList.remove("has-open");
    }
    function closeSoon() {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(close, 220);
    }

    tiles.forEach((t) => {
      const id = t.dataset.person;
      // mouse: open on hover, close when the cursor leaves
      t.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") open(id); });
      t.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") closeSoon(); });
      // touch / keyboard: tap or Enter toggles
      t.addEventListener("click", (e) => {
        if (e.pointerType === "mouse" || (e.pointerType === undefined && canHover.matches)) return;
        if (current === id) close(); else open(id);
      });
      t.addEventListener("focus", () => { if (!t.matches(":hover")) open(id); });
      t.addEventListener("blur", (e) => {
        if (!section.contains(e.relatedTarget)) closeSoon();
      });
    });
    // keep a story open while the cursor reads it (so its links can be clicked)
    bios.forEach((b) => {
      b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && b.classList.contains("is-open")) clearTimeout(closeTimer); });
      b.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") closeSoon(); });
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && current) close(); });
    // tap outside closes on touch screens
    document.addEventListener("click", (e) => { if (current && !e.target.closest(".wh-member, .wh-bio")) close(); });
  }

  function init() {
    setupTeam();
    setupPanels();
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
