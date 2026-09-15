/* 사이트 동작: 최신 글 슬라이더, 주제 필터, Categories 드롭다운.
   자바스크립트가 꺼져 있어도 첫 슬라이드와 전체 글 목록은 그대로 보입니다. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- 슬라이더 */
  function initSlider(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    if (slides.length < 2) return;

    var current = root.querySelector('[data-slider-current]');
    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    var delay = parseInt(root.getAttribute('data-interval'), 10) || 5000;
    var index = 0;
    var timer = null;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (s, n) {
        var on = n === index;
        s.classList.toggle('is-active', on);
        if (on) { s.removeAttribute('aria-hidden'); } else { s.setAttribute('aria-hidden', 'true'); }
        // 숨겨진 슬라이드는 탭 이동에서 빠지게 한다
        s.querySelectorAll('a, button').forEach(function (el) {
          if (on) { el.removeAttribute('tabindex'); }
          else if (el.getAttribute('tabindex') !== '-1') { el.setAttribute('tabindex', '-1'); }
        });
      });
      if (current) current.textContent = String(index + 1);
    }

    // 마우스가 올라가 있거나 안쪽에 초점이 있으면 자동 전환을 멈춘다.
    // 두 조건을 따로 기억해야, 슬라이드 버튼을 누른 뒤에도 멈춘 상태가 풀리지 않는다.
    var hovered = false, focused = false;

    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() {
      stop();
      if (reduceMotion || hovered || focused || document.hidden) return;
      timer = setInterval(function () { show(index + 1); }, delay);
    }
    function go(step) { show(index + step); start(); }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });

    root.addEventListener('mouseenter', function () { hovered = true; start(); });
    root.addEventListener('mouseleave', function () { hovered = false; start(); });
    root.addEventListener('focusin', function () { focused = true; start(); });
    root.addEventListener('focusout', function () { focused = false; start(); });
    document.addEventListener('visibilitychange', start);

    show(0);
    start();
  }

  /* ------------------------------------------------------------------ 필터 */
  function initFilters(bar) {
    var grid = document.querySelector('[data-grid]');
    if (!grid) return;                       // 카드 격자가 없는 페이지에서는 링크로 동작
    var chips = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.card'));
    var empty = document.querySelector('[data-empty]');

    function apply(key) {
      var shown = 0;
      cards.forEach(function (card) {
        var on = key === 'all' || card.getAttribute('data-cat') === key;
        card.hidden = !on;
        if (on) shown++;
      });
      chips.forEach(function (c) {
        c.classList.toggle('is-on', c.getAttribute('data-filter') === key);
      });
      if (empty) empty.hidden = shown !== 0;
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function (e) {
        e.preventDefault();
        apply(chip.getAttribute('data-filter'));
      });
    });
  }

  /* -------------------------------------------------------------- 드롭다운 */
  function initDropdowns() {
    var list = Array.prototype.slice.call(document.querySelectorAll('[data-dropdown]'));
    if (!list.length) return;

    document.addEventListener('click', function (e) {
      list.forEach(function (d) {
        if (d.open && !d.contains(e.target)) d.open = false;
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      list.forEach(function (d) {
        if (d.open) { d.open = false; d.querySelector('summary').focus(); }
      });
    });
    // 하나를 열면 나머지는 닫는다
    list.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        list.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  }

  function ready() {
    document.querySelectorAll('[data-slider]').forEach(initSlider);
    document.querySelectorAll('[data-filters]').forEach(initFilters);
    initDropdowns();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }
})();
