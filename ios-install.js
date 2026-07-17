/**
 * Shows "Add to Home Screen" guide for iOS Safari users.
 */
(function initIosInstallPrompt() {
  var DISMISS_KEY = 'ios_install_dismissed';
  var isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
  var isNative = window.Capacitor && window.Capacitor.isNativePlatform();

  if (!isIos || isStandalone || isNative) {
    return;
  }

  if (localStorage.getItem(DISMISS_KEY) === 'true') {
    return;
  }

  function createBanner() {
    var banner = document.createElement('div');
    banner.className = 'ios-install-banner visible';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'دامەزراندن لەسەر ئایفۆن');
    banner.innerHTML =
      '<h4>📱 دامەزراندن لەسەر ئایفۆن</h4>' +
      '<p>بۆ بەکارهێنان وەک ئەپێکی ڕاستەقینە:<br>' +
      '١. کرتە لە <strong>Share</strong> (⬆️) بکە<br>' +
      '٢. <strong>Add to Home Screen</strong> هەڵبژێرە<br>' +
      '٣. <strong>Add</strong> دابگرە</p>' +
      '<div class="banner-actions">' +
      '<button type="button" class="btn-install" data-action="dismiss">تێگەیشتم</button>' +
      '<button type="button" class="btn-dismiss" data-action="later">دواتر</button>' +
      '</div>';

    banner.addEventListener('click', function (event) {
      var action = event.target.getAttribute('data-action');
      if (!action) {
        return;
      }
      if (action === 'dismiss') {
        localStorage.setItem(DISMISS_KEY, 'true');
      }
      banner.classList.remove('visible');
      setTimeout(function () {
        banner.remove();
      }, 300);
    });

    document.body.appendChild(banner);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(createBanner, 2000);
    });
  } else {
    setTimeout(createBanner, 2000);
  }
})();
