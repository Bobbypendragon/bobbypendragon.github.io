/* Rob Nguyen portfolio: the light/dark switch.
   Loaded without defer in <head>, after the stylesheets, so a saved choice applies before the first paint (no flash).
   dark.css is linked with media="(prefers-color-scheme: dark)": with no saved choice the device decides.
   A saved choice rewrites that media query: "screen" forces dark, "not all" forces light. Print stays light.
   The choice is kept in localStorage on this device only; if storage is blocked the switch still works per page. */
(function () {
  'use strict';
  var KEY = 'theme';
  var root = document.documentElement;
  var link = document.getElementById('theme-dark');
  if (!link) { return; }
  var AUTO = link.getAttribute('media');
  var system = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function saved() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; }
  }
  function mode(choice) {
    if (choice) { return choice; }
    return system && system.matches ? 'dark' : 'light';
  }
  function apply(choice) {
    link.setAttribute('media', choice === 'dark' ? 'screen' : choice === 'light' ? 'not all' : AUTO);
    var m = mode(choice);
    root.setAttribute('data-mode', m);
    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      var next = m === 'dark' ? 'light' : 'dark';
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      btn.setAttribute('title', 'Switch to ' + next + ' mode');
    }
  }

  apply(saved());

  if (system && system.addEventListener) {
    system.addEventListener('change', function () { if (!saved()) { apply(null); } });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = document.querySelector('.theme-toggle');
    if (!btn) { return; }
    btn.hidden = false;
    apply(saved());
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(KEY, next); } catch (e) { /* storage blocked: switch this page only */ }
      apply(next);
    });
  });
}());
