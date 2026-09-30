/*
 * 写真・QRコードの差し替え
 * 画像が読み込めたときだけ表示し、未配置のあいだは「写真」「QRコード」の枠を表示する。
 */
(function () {
  'use strict';

  function showImage(img) {
    img.parentElement.classList.add('has-image');
  }

  document.querySelectorAll('.photo img, .qr img').forEach((img) => {
    if (img.complete && img.naturalWidth > 0) {
      showImage(img);
    } else {
      img.addEventListener('load', () => showImage(img), { once: true });
    }
  });
})();
