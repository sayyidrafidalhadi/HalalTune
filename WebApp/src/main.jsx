import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './store/AuthContext';
import { PlayerProvider } from './store/PlayerContext';
import App from './App';
import './index.css';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => console.log(err));
  });
}

// iOS install banner
(function () {
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone === true;
  const dismissed = localStorage.getItem('ht_ios_banner_dismissed');
  if (isIos && !isStandalone && !dismissed) {
    setTimeout(() => {
      const banner = document.getElementById('ios-install-banner');
      if (banner) {
        banner.style.display = 'flex';
        requestAnimationFrame(() => banner.classList.add('visible'));
      }
    }, 2500);
    document.getElementById('ios-install-close')?.addEventListener('click', () => {
      const banner = document.getElementById('ios-install-banner');
      banner.classList.remove('visible');
      setTimeout(() => { banner.style.display = 'none'; }, 350);
      localStorage.setItem('ht_ios_banner_dismissed', '1');
    });
  }
})();

// Handle deep link
window.addEventListener('load', () => {
  const hash = location.hash;
  if (hash.startsWith('#song/')) {
    sessionStorage.setItem('ht_deeplink', hash.slice(6));
    history.replaceState(null, '', location.pathname);
  }
});

// Hardware back button
window.addEventListener('popstate', () => {
  // Close any open overlays
  const overlays = [
    { sel: '#search-overlay', close: () => document.querySelector('#search-overlay')?.classList.remove('search-overlay-open') },
  ];
  // Simple: just go with the flow
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <PlayerProvider>
      <App />
    </PlayerProvider>
  </AuthProvider>
);
