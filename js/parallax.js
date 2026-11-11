/**
 * Wood Works Studio – image parallax (all pages)
 * Matches the reference: each photo is scaled 1.4x inside its own frame and
 * drifts vertically by up to ±20% of the frame height as the frame travels
 * through the viewport (top of the photo shows as it enters, bottom as it leaves).
 *
 * Uses the individual `translate` / `scale` CSS properties so it combines with
 * any existing hover `transform` on the same image.
 *
 * Opt out:   data-no-parallax on the image or any ancestor
 * Custom track (e.g. a pinned panel): data-parallax-track on an ancestor;
 * progress is then measured from that element instead of the frame.
 */
(function () {
  "use strict";
  if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const SCALE = 1.4;
  const TRAVEL = (SCALE - 1) / 2; // ±20% of frame height
  const MIN_FRAME = 120;          // skip tiny images (chips, icons, logos)
  const SKIP = ".circular-logo, .wh-thumbs, .wh-chip, .lightbox, [class*='lightbox'], header, nav, footer";

  const items = [];

  function frameOf(img) {
    const p = img.parentElement;
    if (!p || p === document.body) return null;
    // the image must be the only in-flow element in its frame
    // (absolutely positioned overlays/captions on top are fine)
    const others = [...p.children].filter((c) => c !== img && c.tagName !== "SOURCE");
    if (p.tagName !== "PICTURE" && others.some((c) => !/absolute|fixed/.test(getComputedStyle(c).position))) return null;
    return p.tagName === "PICTURE" ? p.parentElement : p;
  }

  function collect() {
    document.querySelectorAll("img").forEach((img) => {
      if (img.dataset.pxDone) return;
      if (img.closest("[data-no-parallax]") || img.closest(SKIP)) return;
      const frame = frameOf(img);
      if (!frame) return;
      const r = frame.getBoundingClientRect();
      if (r.height && r.height < MIN_FRAME) return;
      img.dataset.pxDone = "1";
      const cs = getComputedStyle(frame);
      if (cs.overflow === "visible") frame.style.overflow = "hidden";
      img.style.scale = String(SCALE);
      img.style.willChange = "translate";
      const track = img.closest("[data-parallax-track]") || frame;
      items.push({ img, frame, track, visible: true, last: null });
    });
  }

  let ticking = false;
  function update() {
    ticking = false;
    const vh = window.innerHeight;
    for (const it of items) {
      if (!it.visible) continue;
      const tr = it.track.getBoundingClientRect();
      const fh = it.frame.offsetHeight || tr.height;
      // 0 when the track's top meets the viewport bottom, 1 when its bottom meets the viewport top
      let p = (vh - tr.top) / (vh + tr.height);
      p = Math.max(0, Math.min(1, p));
      const y = Math.round((p * 2 - 1) * TRAVEL * fh * 10) / 10;
      if (y !== it.last) {
        it.img.style.translate = "0 " + y + "px";
        it.last = y;
      }
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  function init() {
    collect();
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          items.forEach((i) => { if (i.track === e.target) i.visible = e.isIntersecting; });
        });
        onScroll();
      }, { rootMargin: "200px 0px" });
      new Set(items.map((i) => i.track)).forEach((t) => io.observe(t));
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // late images (lazy) can change frame sizes
    window.addEventListener("load", onScroll);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
