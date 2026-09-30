/*
 * 表示領域の固定
 * Safari では reveal.js が読む表示領域の大きさが実際より大きくなり、スライドの端が切れることがある。
 * 複数の方法で測った表示領域のうち最小の値に .reveal の大きさを固定してから、reveal.js に再計算させる。
 * フルスクリーン切り替え中の途中のサイズを拾わないよう、切り替え後にも少し時間をおいて再計算する。
 *
 * URL に ?debug を付けると、測定値を画面の隅に表示する。
 */
(function () {
  'use strict';

  const RELAYOUT_DELAYS = [0, 150, 500, 1000];
  const wrapper = document.querySelector('.reveal');
  const debug = new URLSearchParams(location.search).has('debug');
  let timers = [];
  let debugPanel = null;

  function measureViewport() {
    const root = document.documentElement;
    const vv = window.visualViewport;
    const widths = [window.innerWidth, root.clientWidth];
    const heights = [window.innerHeight, root.clientHeight];
    if (vv) {
      widths.push(vv.width * vv.scale);
      heights.push(vv.height * vv.scale);
    }
    return {
      width: Math.floor(Math.min(...widths.filter(Boolean))),
      height: Math.floor(Math.min(...heights.filter(Boolean))),
      widths,
      heights
    };
  }

  function showDebug(size) {
    if (!debugPanel) {
      debugPanel = document.createElement('pre');
      debugPanel.className = 'fit-debug';
      document.body.appendChild(debugPanel);
    }
    const scale = Reveal.isReady() ? Reveal.getScale().toFixed(3) : '-';
    debugPanel.textContent = [
      `widths  ${size.widths.map(Math.round).join(' / ')}`,
      `heights ${size.heights.map(Math.round).join(' / ')}`,
      `used    ${size.width} x ${size.height}`,
      `scale   ${scale}   dpr ${window.devicePixelRatio}`
    ].join('\n');
  }

  function fit() {
    const size = measureViewport();
    wrapper.style.width = `${size.width}px`;
    wrapper.style.height = `${size.height}px`;
    if (Reveal.isReady()) Reveal.layout();
    if (debug) showDebug(size);
  }

  function scheduleFit() {
    timers.forEach(clearTimeout);
    timers = RELAYOUT_DELAYS.map((delay) => setTimeout(fit, delay));
  }

  fit();
  Reveal.on('ready', scheduleFit);
  ['fullscreenchange', 'webkitfullscreenchange'].forEach((type) => {
    document.addEventListener(type, scheduleFit);
  });
  window.addEventListener('resize', scheduleFit);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleFit);
  }
})();
