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
    const rows = [...root.querySelectorAll(".wh-frow")];
    if (!rows.length) return;
    const link = root.querySelector(".wh-feature-foot .wh-slide-link");
    const count = root.querySelector(".wh-count");
    const progress = root.querySelector(".wh-progress");
    const dotsWrap = root.querySelector(".wh-dots-row");
    const DURATION = 6000;
    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    let index = 0, timer = null, hovering = false;

    const dots = rows.map((r, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show project " + (i + 1));
      b.addEventListener("click", () => go(i, true, i > index ? 1 : -1));
      dotsWrap && dotsWrap.appendChild(b);
      return b;
    });
    const pad = (n) => String(n).padStart(2, "0");

    function render() {
      rows.forEach((r, i) => {
        const on = i === index;
        r.classList.toggle("is-active", on);
        r.setAttribute("aria-hidden", on ? "false" : "true");
      });
      dots.forEach((d, i) => d.setAttribute("aria-current", i === index ? "true" : "false"));
      if (count) count.textContent = pad(index + 1) + " / " + pad(rows.length);
      if (link) {
        link.href = rows[index].dataset.href;
        link.setAttribute("aria-label", "View project: " + rows[index].querySelector(".wh-slide-name").textContent);
      }
      restartProgress();
    }

    // the whole row leaves one way while the next arrives from the other
    function slide(from, to, dir) {
      const out = rows[from], inn = rows[to];
      rows.forEach((r) => r.getAnimations().forEach((a) => a.cancel()));
      rows.forEach((r) => r.classList.remove("is-leaving"));
      if (reduceMotion || !Element.prototype.animate) return;
      const off = (d) => (d > 0 ? "calc(100% + 24px)" : "calc(-100% - 24px)");
      const shift = off(dir), back = off(-dir);
      out.classList.add("is-leaving");
      out.animate([{ transform: "translateX(0)" }, { transform: "translateX(" + back + ")" }],
        { duration: 750, easing: EASE }).onfinish = () => out.classList.remove("is-leaving");
      inn.animate([{ transform: "translateX(" + shift + ")" }, { transform: "translateX(0)" }],
        { duration: 750, easing: EASE });
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
      const next = (i + rows.length) % rows.length;
      if (next === prev) return;
      index = next;
      render();
      slide(prev, next, dirHint || (i > prev ? 1 : -1));
      if (user) schedule();
    }

    let heroVisible = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe(root);
    }
    function schedule() {
      clearTimeout(timer);
      if (reduceMotion) return;
      timer = setTimeout(function tick() {
        if (!hovering && !document.hidden && heroVisible) go(index + 1, false, 1);
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

    // swipe / drag: left brings the next project in from the right
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
    root.addEventListener("pointercancel", () => { startX = null; });
    root.addEventListener("dragstart", (e) => e.preventDefault()); // links/photos would start a native drag
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
    const live = new Set();
    let ticking = false;
    // keep each live panel's card layer still on screen: move it by -panelTop
    function place() {
      ticking = false;
      live.forEach((panel) => {
        const pin = panel.querySelector(".wh-panel-pin");
        const top = panel.getBoundingClientRect().top;
        pin.style.transform = "translate3d(0," + (-top).toFixed(1) + "px,0)";
      });
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(place); } }
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          e.target.classList.toggle("is-live", e.isIntersecting);
          if (e.isIntersecting) live.add(e.target); else live.delete(e.target);
        });
        place();
      }, { rootMargin: "2px 0px" });
      panels.forEach((p) => io.observe(p));
    } else {
      panels.forEach((p) => { p.classList.add("is-live"); live.add(p); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    panels.forEach((panel) => {
      panel.addEventListener("focusin", () => {
        const r = panel.getBoundingClientRect();
        if (Math.abs(r.top) > 4) window.scrollTo({ top: window.scrollY + r.top, behavior: reduceMotion ? "auto" : "smooth" });
      });
    });
  }

  // ---------- Team: hover/tap a portrait to open their story ----------
  // Team: portrait accordion (one open at a time, always one open)
  function setupTeam() {
    const stage = document.querySelector("[data-wt]");
    if (!stage) return;
    const pans = [...stage.querySelectorAll(".wt-pan")];
    let timer = 0;
    // the open story is laid out at the open panel's final width
    // (flex 3.2 : 1, 16px gap) so its text never re-wraps while animating
    const sizeStory = () => {
      const open = (stage.clientWidth - 16) * 3.2 / 4.2;
      const pad = Math.min(36, Math.max(20, window.innerWidth * 0.025));
      stage.style.setProperty("--wt-open-w", Math.max(200, Math.round(open - pad * 2)) + "px");
      // closed strips: drop the vertical name to the bottom edge (past the
      // hidden role-less space taken by the story underneath it)
      pans.forEach((p) => {
        const bio = p.querySelector(".wt-bio");
        if (bio) p.style.setProperty("--wt-drop", (bio.offsetHeight + 12) + "px");
      });
    };
    sizeStory();
    window.addEventListener("resize", sizeStory, { passive: true });
    function open(p) {
      if (p.classList.contains("is-open")) return;
      pans.forEach((q) => {
        const on = q === p;
        q.classList.toggle("is-open", on);
        q.setAttribute("aria-expanded", on ? "true" : "false");
      });
    }
    pans.forEach((p) => {
      // mouse: a short hover intent so passing over a strip doesn't flip it
      p.addEventListener("pointerenter", (e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(timer);
        timer = setTimeout(() => open(p), 120);
      });
      p.addEventListener("pointerleave", () => clearTimeout(timer));
      p.addEventListener("click", () => open(p));
      p.addEventListener("focus", () => open(p));
    });
  }

  // The contact form already sends to WhatsApp: hide the floating bubble there
  function setupContactFloat() {
    const contact = document.getElementById("contact");
    if (!contact) return;
    if (!("IntersectionObserver" in window)) { contact.classList.add("is-live"); return; }
    new IntersectionObserver(([e]) => {
      document.body.classList.toggle("wh-contact-in-view", e.intersectionRatio >= 0.35);
      contact.classList.toggle("is-live", e.isIntersecting); // photo loops only run on screen
    }, { threshold: [0, 0.35] }).observe(contact);
  }

  // Why Us brand strip: only scroll while the section is on screen
  function setupWhyBrands() {
    const sec = document.querySelector(".wy");
    if (!sec) return;
    if (!("IntersectionObserver" in window)) { sec.classList.add("is-live"); return; }
    new IntersectionObserver(([e]) => sec.classList.toggle("is-live", e.isIntersecting)).observe(sec);
  }

  // Old reviews strip: only animate while it is on screen
  function setupReviewsMarquee() {
    const m = document.querySelector(".reviews-marquee");
    if (!m) return;
    m.classList.add("is-paused");
    if (!("IntersectionObserver" in window)) { m.classList.remove("is-paused"); return; }
    new IntersectionObserver(([e]) => m.classList.toggle("is-paused", !e.isIntersecting)).observe(m);
  }

  // Reviews: sideways slider with endless loop (clones at both ends)
  function setupReviews() {
    const section = document.querySelector(".wh-tm");
    const root = section && section.querySelector("[data-wh-tm]");
    if (!root) return;
    const track = root.querySelector(".wh-tm-track");
    const all = [...track.children];             // clone-last, s1..sN, clone-first
    const real = all.filter((s) => !s.hasAttribute("data-clone"));
    let pos = 1, busy = false;
    const count = root.querySelector("[data-tm-count]");
    function place(animate) {
      track.classList.toggle("no-anim", !animate);
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.style.transform = "translate3d(" + (-pos * (root.querySelector(".wh-tm-viewport").clientWidth + gap)) + "px,0,0)";
      real.forEach((s, k) => s.setAttribute("aria-hidden", k === pos - 1 ? "false" : "true"));
      if (count) {
        const n = real.length, i = pos === 0 ? n : pos === n + 1 ? 1 : pos;
        count.textContent = String(i).padStart(2, "0") + " / " + String(n).padStart(2, "0");
      }
    }
    function go(step) {
      if (busy) return;
      busy = !reduceMotion;
      pos += step;
      place(!reduceMotion);
      if (reduceMotion) settle();
    }
    function settle() {
      busy = false;
      if (pos === 0) { pos = real.length; place(false); }
      else if (pos === real.length + 1) { pos = 1; place(false); }
    }
    track.addEventListener("transitionend", (e) => { if (e.target === track) settle(); });
    root.querySelector("[data-tm-prev]").addEventListener("click", () => go(-1));
    root.querySelector("[data-tm-next]").addEventListener("click", () => go(1));
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });
    let x0 = null;
    root.addEventListener("pointerdown", (e) => { if (!e.target.closest("button")) x0 = e.clientX; });
    root.addEventListener("pointerup", (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
    });
    window.addEventListener("resize", () => place(false));
    // the seal only turns while the section is on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => section.classList.toggle("is-live", e.isIntersecting)).observe(section);
    } else section.classList.add("is-live");
    place(false);
  }

  // How we work + FAQs: accordion (several can be open, like the reference)
  function setupFaq() {
    document.querySelectorAll(".wh-faq-q button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".wh-faq-item");
        const open = !item.classList.contains("is-open");
        item.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });
  }

  // ---------- Why us: six reasons in a scroll window ----------
  function setupWhy() {
    const root = document.querySelector("[data-wh-why]");
    if (!root) return;
    const sec = root.closest(".wh-why");
    const frame = root.querySelector(".wh-why-frame");
    const list = root.querySelector(".wh-why-list");
    const items = [...root.querySelectorAll(".wh-why-item")];
    const shots = [...root.querySelectorAll(".wh-why-shot")];
    if (!list || !items.length) return;
    let cur = Math.max(0, items.findIndex((it) => it.classList.contains("is-active")));

    // inner scroll: our own smooth glide while the list can move, then the
    // page (Lenis) takes over at either end
    let pos = 0, target = 0, raf = 0;
    const maxScroll = () => list.scrollHeight - list.clientHeight;
    const boxed = () => maxScroll() > 1 && getComputedStyle(list).overflowY !== "visible";
    function step() {
      const d = target - pos;
      if (Math.abs(d) < 0.5) { pos = target; list.scrollTop = pos; raf = 0; return; }
      pos += d * 0.14;
      list.scrollTop = pos;
      raf = requestAnimationFrame(step);
    }
    function glideTo(y) {
      target = Math.max(0, Math.min(maxScroll(), y));
      if (reduceMotion) { list.scrollTop = target; return; }
      if (!raf) { pos = list.scrollTop; raf = requestAnimationFrame(step); }
    }
    list.addEventListener("wheel", (e) => {
      if (e.ctrlKey || !boxed() || !document.documentElement.classList.contains("lenis")) return;
      const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? list.clientHeight : 1);
      if (!dy) return;
      const base = raf ? target : list.scrollTop;
      const max = maxScroll();
      if ((dy > 0 && base >= max - 1) || (dy < 0 && base <= 1)) return; // at an end: page scrolls
      e.preventDefault();
      e.stopPropagation(); // keep Lenis (window) from also scrolling the page
      glideTo(base + dy);
    }, { passive: false });

    function edges() {
      const max = maxScroll();
      frame.classList.toggle("is-scrolled", list.scrollTop > 2);
      frame.classList.toggle("is-end", max <= 1 || list.scrollTop >= max - 2);
    }
    list.addEventListener("scroll", () => {
      if (!raf) pos = target = list.scrollTop;
      edges();
    }, { passive: true });
    // window height = the first four reasons (the first one open), so
    // 05 and 06 sit just below the line and scroll up into view
    function fit() {
      if (getComputedStyle(list).overflowY === "visible") { sec.style.removeProperty("--why-h"); edges(); return; }
      const rows = items.slice(0, 4).map((it) => it.querySelector(".wh-why-row").offsetHeight);
      const desc = items[0].querySelector(".wh-why-desc > div").scrollHeight;
      const h = rows.reduce((a, b) => a + b, 0) + desc + 3;
      const pad = cur === 0 ? 0 : -14; // row 1 measured closed: use its open padding
      sec.style.setProperty("--why-h", Math.round(h + pad) + "px");
      edges();
    }
    let rz = 0;
    window.addEventListener("resize", () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(fit); }, { passive: true });
    fit();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);

    function reveal(it) {
      if (!boxed()) return;
      const lr = list.getBoundingClientRect();
      const ir = it.getBoundingClientRect();
      const extra = Math.max(0, it.scrollHeight - ir.height); // still opening
      const bottom = ir.bottom + extra - lr.bottom + 8;
      if (bottom > 0) glideTo(list.scrollTop + bottom);
      else if (ir.top < lr.top) glideTo(list.scrollTop + (ir.top - lr.top) - 8);
    }

    function activate(i, show) {
      if (i === cur || !items[i]) { if (show && items[i]) reveal(items[i]); return; }
      items[cur].classList.remove("is-active");
      items[cur].querySelector(".wh-why-row").setAttribute("aria-expanded", "false");
      if (shots[cur]) { shots[cur].classList.remove("is-active"); shots[cur].setAttribute("aria-hidden", "true"); }
      cur = i;
      items[i].classList.add("is-active");
      items[i].querySelector(".wh-why-row").setAttribute("aria-expanded", "true");
      if (shots[i]) { shots[i].classList.add("is-active"); shots[i].removeAttribute("aria-hidden"); }
      if (show) setTimeout(() => reveal(items[i]), 420);
    }

    items.forEach((it, i) => {
      it.style.setProperty("--i", i);
      const b = it.querySelector(".wh-why-row");
      b.addEventListener("click", () => activate(i, true));
      b.addEventListener("focus", () => activate(i, true));
    });

    // hover with intent: only a real pointer move opens a row, so rows
    // sliding under a still cursor (while opening or scrolling) never chain
    let lx = -1, ly = -1, timer = 0;
    list.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      if (Math.abs(e.clientX - lx) < 2 && Math.abs(e.clientY - ly) < 2) return;
      lx = e.clientX; ly = e.clientY;
      const it = e.target.closest(".wh-why-item");
      clearTimeout(timer);
      if (!it) return;
      const i = items.indexOf(it);
      if (i !== cur) timer = setTimeout(() => activate(i, false), 90);
    });
    list.addEventListener("pointerleave", () => clearTimeout(timer));

    // entrance
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const media = root.querySelector(".wh-why-media");
    if (media) media.style.setProperty("--i", 2);
    sec.classList.add("is-anim");
    const io = new IntersectionObserver((en) => {
      if (en[0].isIntersecting) { sec.classList.add("is-in"); io.disconnect(); }
    }, { rootMargin: "0px 0px -15% 0px" });
    io.observe(root);
  }

  // Portfolio card button: one hover state for every copy of the fixed card,
  // decided by where the pointer is, so it stays steady while panels scroll
  (function () {
    const btns = [...document.querySelectorAll(".wh-panel .wh-btn")];
    if (!btns.length || !window.matchMedia("(hover: hover)").matches) return;
    let x = -1, y = -1, hot = false, raf = 0;
    function check() {
      raf = 0;
      let on = false;
      for (const b of btns) {
        const r = b.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) { on = true; break; }
      }
      if (on !== hot) { hot = on; btns.forEach((b) => b.classList.toggle("is-hot", on)); }
    }
    const queue = () => { if (!raf) raf = requestAnimationFrame(check); };
    window.addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; queue(); }, { passive: true });
    // on scroll, measure one frame later, after the panels have re-pinned the card
    window.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(() => { raf = requestAnimationFrame(check); }); }, { passive: true });
    // pointer left the window entirely
    window.addEventListener("mouseout", (e) => { if (!e.relatedTarget) { x = y = -1; queue(); } });
  })();

  // Background tab: pause CSS animations (rule in home-hero.css)
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("wws-hidden", document.hidden);
  });

  function init() {
    setupFaq();
    setupWhy();
    setupReviews();
    setupReviewsMarquee();
    setupContactFloat();
    setupWhyBrands();
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
