/* Rob Nguyen portfolio: progressive enhancement only.
   - Gallery lightbox (native <dialog>, arrow keys, Escape, focus returns to the thumbnail), and the
     "See all (n)" links that open it at a given image.
   - "Close details" links that fold their <details> and return focus to its summary.
   Safe DOM only: createElement and textContent. No HTML strings, no network requests. */
(function () {
  'use strict';

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    }
    if (text) { node.textContent = text; }
    return node;
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var links = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
    if (!links.length || typeof HTMLDialogElement === 'undefined') { return; }

    var dialog = el('dialog', { 'class': 'lightbox', 'aria-labelledby': 'lb-caption' });
    var bar = el('div', { 'class': 'lb-bar' });
    var count = el('p', { 'class': 'lb-count', 'aria-live': 'polite' });
    var btns = el('div', { 'class': 'lb-buttons' });
    var prev = el('button', { type: 'button' }, 'Previous');
    var next = el('button', { type: 'button' }, 'Next');
    var open = el('a', { target: '_blank', rel: 'noopener noreferrer' }, 'Open full size');
    var close = el('button', { type: 'button' }, 'Close');
    btns.append(prev, next, open, close);
    bar.append(count, btns);
    var fig = el('figure', { 'class': 'lb-figure' });
    var img = el('img', { alt: '' });
    var cap = el('figcaption', { id: 'lb-caption' });
    fig.append(img, cap);
    dialog.append(bar, fig);
    document.body.append(dialog);

    var group = [];
    var index = 0;
    var opener = null;

    function show(i) {
      index = (i + group.length) % group.length;
      var a = group[index];
      var thumb = a.querySelector('img');
      img.src = a.getAttribute('href');
      img.alt = thumb ? thumb.getAttribute('alt') : (a.getAttribute('data-alt') || '');
      var w = a.getAttribute('data-w');
      var h = a.getAttribute('data-h');
      if (w && h) { img.width = Number(w); img.height = Number(h); }
      cap.textContent = a.getAttribute('data-caption') || img.alt;
      open.setAttribute('href', a.getAttribute('href'));
      count.textContent = group.length > 1 ? 'Image ' + (index + 1) + ' of ' + group.length : '';
      prev.hidden = next.hidden = group.length < 2;
      dialog.scrollTop = 0;
    }

    function openGroup(name, start, from) {
      group = links.filter(function (x) { return x.getAttribute('data-lightbox') === name; });
      if (!group.length) { return false; }
      opener = from;
      show(start);
      dialog.showModal();
      close.focus();
      return true;
    }

    links.forEach(function (a) {
      a.addEventListener('click', function (ev) {
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button !== 0) { return; }
        ev.preventDefault();
        var name = a.getAttribute('data-lightbox');
        openGroup(name, links.filter(function (x) { return x.getAttribute('data-lightbox') === name; }).indexOf(a), a);
      });
    });

    /* "See all (n)": opens a group's lightbox at a given image (data-start, counted from 0). */
    Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox-open]')).forEach(function (a) {
      a.addEventListener('click', function (ev) {
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button !== 0) { return; }
        if (openGroup(a.getAttribute('data-lightbox-open'), Number(a.getAttribute('data-start')) || 0, a)) {
          ev.preventDefault();
        }
      });
    });

    prev.addEventListener('click', function () { show(index - 1); });
    next.addEventListener('click', function () { show(index + 1); });
    close.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (ev) { if (ev.target === dialog) { dialog.close(); } });
    dialog.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight' && group.length > 1) { ev.preventDefault(); show(index + 1); }
      if (ev.key === 'ArrowLeft' && group.length > 1) { ev.preventDefault(); show(index - 1); }
    });
    /* Swipe left or right on a touch screen (pointer events). Two fingers are a pinch-zoom, which is
       left to the browser, and nothing changes while the page is zoomed in. */
    var start = null;
    var fingers = 0;
    fig.addEventListener('pointerdown', function (ev) {
      if (ev.pointerType === 'mouse') { return; }
      fingers += 1;
      start = fingers === 1 ? { x: ev.clientX, y: ev.clientY } : null;
    });
    fig.addEventListener('pointerup', function (ev) {
      if (ev.pointerType === 'mouse') { return; }
      fingers = Math.max(0, fingers - 1);
      if (!start || group.length < 2) { start = fingers ? start : null; return; }
      var dx = ev.clientX - start.x;
      var dy = ev.clientY - start.y;
      start = null;
      var zoomed = window.visualViewport && window.visualViewport.scale > 1.01;
      if (!zoomed && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { show(index + (dx < 0 ? 1 : -1)); }
    });
    fig.addEventListener('pointercancel', function () { fingers = 0; start = null; });

    dialog.addEventListener('close', function () {
      img.removeAttribute('src');
      if (opener) { opener.focus(); }
    });
  }

  /* ---------- "Close details": folds the details it sits in and returns focus to its summary ---------- */
  function initCloseDetails() {
    Array.prototype.slice.call(document.querySelectorAll('.close-details a')).forEach(function (a) {
      a.addEventListener('click', function (ev) {
        var box = a.closest('details');
        if (!box) { return; }
        ev.preventDefault();
        box.open = false;
        var summary = box.querySelector('summary');
        if (summary) {
          summary.focus();
          summary.scrollIntoView({ block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initLightbox();
    initCloseDetails();
  });
}());
