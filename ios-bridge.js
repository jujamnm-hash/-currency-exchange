/**
 * Capacitor native bridge for iOS — loaded only inside the native shell.
 */
(function initCapacitorBridge() {
  if (!window.Capacitor || !window.Capacitor.isNativePlatform()) {
    return;
  }

  document.documentElement.classList.add('capacitor-native', 'ios-native');

  function configureNativeChrome() {
    if (!window.Capacitor.Plugins) {
      return;
    }

    const { SplashScreen, StatusBar } = window.Capacitor.Plugins;

    if (SplashScreen && SplashScreen.hide) {
      SplashScreen.hide().catch(function () {});
    }

    if (StatusBar) {
      if (StatusBar.setStyle) {
        StatusBar.setStyle({ style: 'LIGHT' }).catch(function () {});
      }
      if (StatusBar.setBackgroundColor) {
        StatusBar.setBackgroundColor({ color: '#667eea' }).catch(function () {});
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configureNativeChrome);
  } else {
    configureNativeChrome();
  }
})();
