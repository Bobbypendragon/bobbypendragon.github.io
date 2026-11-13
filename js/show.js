/* Rob Nguyen portfolio, the show design: the phone menu. Progressive enhancement: without this script
   every link stays reachable. Safe DOM only (no HTML strings, no storage, no network requests). */
(function () {
  'use strict';

  /* ---------- Phone menu: a disclosure button; Escape closes it and returns focus ---------- */
  function initMenu() {
    var btn = document.querySelector('.menu-toggle');
    var nav = btn ? document.getElementById(btn.getAttribute('aria-controls')) : null;
    if (!btn || !nav) { return; }
    var header = btn.closest('.site-header');
    header.classList.add('has-menu');
    btn.hidden = false;

    function isOpen() { return btn.getAttribute('aria-expanded') === 'true'; }
    function set(open, returnFocus) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      header.classList.toggle('menu-open', open);
      if (!open && returnFocus) { btn.focus(); }
    }

    btn.addEventListener('click', function () { set(!isOpen(), false); });
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && isOpen()) { ev.preventDefault(); set(false, true); }
    });
    document.addEventListener('click', function (ev) {
      if (isOpen() && !header.contains(ev.target)) { set(false, false); }
    });
    nav.addEventListener('focusout', function (ev) {
      if (isOpen() && ev.relatedTarget && !header.contains(ev.relatedTarget)) { set(false, false); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
  });
}());
