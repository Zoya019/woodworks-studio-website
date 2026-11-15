// Gallery page: furniture filter tabs, "Show more", and reveal on scroll.
// Only opacity/transform animate (see css/gallery.css).
document.addEventListener('DOMContentLoaded', function () {
  document.documentElement.classList.add('gx-js');

  var STEP = 12;
  var mosaic = document.querySelector('[data-gx-mosaic]');
  var moreWrap = document.querySelector('[data-gx-more]');
  var tabs = document.querySelectorAll('.gx-tab');
  if (mosaic) {
    var tiles = Array.prototype.slice.call(mosaic.querySelectorAll('.gx-tile'));
    var filter = 'all';
    var shown = STEP;

    var render = function () {
      var matches = tiles.filter(function (t) { return filter === 'all' || t.getAttribute('data-cat') === filter; });
      tiles.forEach(function (t) { t.hidden = true; });
      matches.forEach(function (t, i) { t.hidden = i >= shown; });
      if (moreWrap) moreWrap.hidden = matches.length <= shown;
    };

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (b) { b.setAttribute('aria-pressed', b === tab ? 'true' : 'false'); });
        filter = tab.getAttribute('data-filter');
        shown = STEP;
        render();
        if (window.lenis && typeof window.lenis.resize === 'function') window.lenis.resize();
      });
    });

    if (moreWrap) {
      moreWrap.querySelector('button').addEventListener('click', function () {
        shown += STEP;
        render();
        if (window.lenis && typeof window.lenis.resize === 'function') window.lenis.resize();
      });
    }
    render();
  }

  // Reveal project cards as they enter the screen
  var rv = document.querySelectorAll('.gx-rv');
  if (!('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (el) { io.observe(el); });
  }
});
