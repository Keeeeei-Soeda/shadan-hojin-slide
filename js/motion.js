/*
 * 自動モーション
 * - 各スライドの対象要素を上から順に拾い、表示順（--i）と開始時刻（--d）を付与する
 * - 表示中のスライドに .m-play を付け直して、毎回アニメーションを再生する
 * - .m-count のカウントアップを行う
 *
 * 間隔の調整（HTML側の属性）：
 *   data-step="90"  … この要素の内側にある対象の間隔（ms）。既定は120ms
 *   data-gap="400"  … この要素だけ、直前の対象からの間隔（ms）を指定
 */
(function () {
  'use strict';

  const DEFAULT_STEP = 120;
  const COUNT_DURATION = 900;

  const TARGET_SELECTOR = [
    ':scope > *',
    '[data-motion]',
    '.m-group > *',
    '.m-stagger-children > *',
    '.m-line',
    '.m-scale',
    '.m-star-unit',
    '.m-mask',
    '.m-frame',
    '.m-ring',
    '.m-wipe',
    '.m-strike',
    '.m-emph',
    '.m-count'
  ].join(',');

  // 自身はアニメーションせず、中身だけを対象にする要素
  const CONTAINER_SELECTOR = '.m-group, .m-stagger-children, .m-star, .notes';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let timers = [];

  function splitStars(section) {
    section.querySelectorAll('.m-star').forEach((star) => {
      const chars = Array.from(star.textContent);
      star.textContent = '';
      chars.forEach((char) => {
        if (char === '★') {
          const unit = document.createElement('span');
          unit.className = 'm-star-unit';
          unit.textContent = char;
          star.appendChild(unit);
        } else {
          star.appendChild(document.createTextNode(char));
        }
      });
    });
  }

  function wrapMasks(section) {
    section.querySelectorAll('.m-mask').forEach((mask) => {
      const inner = document.createElement('span');
      inner.className = 'm-mask-inner';
      while (mask.firstChild) inner.appendChild(mask.firstChild);
      mask.appendChild(inner);
    });
  }

  function createSvg(className, viewBox) {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('class', className);
    svg.setAttribute('aria-hidden', 'true');
    if (viewBox) svg.setAttribute('viewBox', viewBox);
    return svg;
  }

  function buildFrames(section) {
    section.querySelectorAll('.m-frame').forEach((frame) => {
      const svg = createSvg('frame-line');
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('width', '100%');
      rect.setAttribute('height', '100%');
      rect.setAttribute('pathLength', '1');
      svg.appendChild(rect);
      frame.appendChild(svg);
    });
  }

  function buildRings(section) {
    section.querySelectorAll('.m-ring').forEach((ring) => {
      const size = parseFloat(getComputedStyle(ring).width);
      const svg = createSvg('ring', `0 0 ${size} ${size}`);
      const circle = document.createElementNS(SVG_NS, 'circle');
      circle.setAttribute('cx', size / 2);
      circle.setAttribute('cy', size / 2);
      circle.setAttribute('r', size / 2 - 1);
      circle.setAttribute('pathLength', '1');
      svg.appendChild(circle);
      ring.appendChild(svg);
    });
  }

  function stepBefore(el) {
    const scope = el.parentElement.closest('[data-step]');
    return scope ? Number(scope.dataset.step) : DEFAULT_STEP;
  }

  function assignOrder(section) {
    const targets = Array.from(section.querySelectorAll(TARGET_SELECTOR))
      .filter((el) => !el.matches(CONTAINER_SELECTOR));

    let delay = 0;
    targets.forEach((el, i) => {
      if (i > 0) {
        delay += el.dataset.gap ? Number(el.dataset.gap) : stepBefore(el);
      }
      el.classList.add('m-item');
      el.style.setProperty('--i', i);
      el.style.setProperty('--d', `${delay}ms`);
      el.dataset.motionDelay = delay;
    });

    section.motionTargets = targets;
  }

  function prepare(section) {
    splitStars(section);
    wrapMasks(section);
    buildFrames(section);
    buildRings(section);
    assignOrder(section);
  }

  function isAutoAnimatePair(from, to) {
    return Boolean(from && to)
      && from.hasAttribute('data-auto-animate')
      && to.hasAttribute('data-auto-animate')
      && from.getAttribute('data-auto-animate-id') === to.getAttribute('data-auto-animate-id');
  }

  // auto-animate で移動する要素とその親子は、位置の補間を優先して再生しない
  function markAutoAnimateEntry(section, isAutoEntry) {
    section.motionTargets.forEach((el) => {
      const moves = el.closest('[data-id]') || el.querySelector('[data-id]');
      el.classList.toggle('m-skip', isAutoEntry && Boolean(moves));
    });
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function glow(el) {
    el.classList.remove('is-glowing');
    void el.offsetWidth;
    el.classList.add('is-glowing');
  }

  function runCount(el) {
    const to = Number(el.dataset.to);
    if (reducedMotion.matches || el.classList.contains('m-skip')) {
      el.textContent = to;
      return;
    }

    el.textContent = '0';
    const start = () => {
      const startedAt = performance.now();
      const tick = (now) => {
        const t = Math.min((now - startedAt) / COUNT_DURATION, 1);
        el.textContent = Math.round(to * easeOutCubic(t));
        if (t < 1) {
          timers.push({ frame: requestAnimationFrame(tick) });
        } else {
          glow(el);
        }
      };
      timers.push({ frame: requestAnimationFrame(tick) });
    };
    timers.push({ timeout: setTimeout(start, Number(el.dataset.motionDelay)) });
  }

  function clearTimers() {
    timers.forEach(({ timeout, frame }) => {
      if (timeout) clearTimeout(timeout);
      if (frame) cancelAnimationFrame(frame);
    });
    timers = [];
  }

  function stop(section) {
    section.classList.remove('m-play');
    section.querySelectorAll('.m-count').forEach((el) => {
      el.classList.remove('is-glowing');
      el.textContent = el.dataset.to;
    });
  }

  function play(section) {
    clearTimers();
    section.classList.remove('m-play');
    void section.offsetWidth;
    section.classList.add('m-play');
    section.querySelectorAll('.m-count').forEach(runCount);
  }

  document.querySelectorAll('.reveal .slides > section').forEach(prepare);

  Reveal.on('ready', (event) => {
    play(event.currentSlide);
  });

  Reveal.on('slidechanged', (event) => {
    if (event.previousSlide) stop(event.previousSlide);
    markAutoAnimateEntry(event.currentSlide, isAutoAnimatePair(event.previousSlide, event.currentSlide));
    play(event.currentSlide);
  });
})();
