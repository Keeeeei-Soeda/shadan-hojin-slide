/*
 * 画面サイズの再計算
 * Safari はフルスクリーンの切り替えアニメーション中にサイズ変更を通知するため、
 * reveal.js が途中のサイズで倍率を決めてしまい、スライドの端が切れることがある。
 * 切り替えやサイズ変更のあと、少し時間をおいて再計算する。
 */
(function () {
  'use strict';

  const RELAYOUT_DELAYS = [100, 400, 900];
  let timers = [];

  function scheduleRelayout() {
    timers.forEach(clearTimeout);
    timers = RELAYOUT_DELAYS.map((delay) => setTimeout(() => {
      if (Reveal.isReady()) Reveal.layout();
    }, delay));
  }

  ['fullscreenchange', 'webkitfullscreenchange'].forEach((type) => {
    document.addEventListener(type, scheduleRelayout);
  });
  window.addEventListener('resize', scheduleRelayout);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleRelayout);
  }
})();
