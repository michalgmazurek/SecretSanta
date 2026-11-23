import { Platform } from 'react-native';

// Licznik unikatowych wejść (tylko web). Każda przeglądarka liczy się raz.
// Podgląd: w konsoli przeglądarki wpisz  __wejscia
if (Platform.OS === 'web' && location.hostname.endsWith('github.io')) {
  const API = 'https://countapi.mileshilliard.com/api/v1/';
  const KEY = 'ss-2d1c972772cdaa7f';
  const SEEN = 'ss-visited';

  try {
    if (!localStorage.getItem(SEEN)) {
      fetch(API + 'hit/' + KEY)
        .then((r) => { if (r.ok) localStorage.setItem(SEEN, '1'); })
        .catch(() => {});
    }
  } catch {}

  Object.defineProperty(window, '__wejscia', {
    get: () => fetch(API + 'get/' + KEY).then((r) => r.json()).then((d) => d.value ?? 0),
  });
}
