import { Platform } from 'react-native';

// Efekty tylko dla przeglądarki: fonty, deszcz kodu w tle, kolory kursora i zaznaczenia.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=VT323&display=swap';
  document.head.appendChild(font);

  const css = document.createElement('style');
  css.textContent = `
    html, body { background: #000; }
    #root { position: relative; z-index: 1; }
    input { caret-color: #00FF41; }
    ::selection { background: #00FF41; color: #000; }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-thumb { background: #0B5D1E; border-radius: 4px; }
    #santa-hat { filter: drop-shadow(0 0 3px rgba(0, 255, 65, 0.55)) drop-shadow(0 0 10px rgba(0, 255, 65, 0.25)); }
    #crt {
      position: fixed; inset: 0; z-index: 2; pointer-events: none;
      background:
        repeating-linear-gradient(to bottom, rgba(0, 0, 0, 0) 0 2px, rgba(0, 0, 0, 0.14) 2px 3px),
        radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.3) 100%);
    }
    @media (prefers-reduced-motion: no-preference) {
      #crt { animation: crt-flicker 6s infinite steps(1); }
      @keyframes crt-flicker { 0%, 100% { opacity: 1; } 47% { opacity: 0.92; } 48% { opacity: 1; } 83% { opacity: 0.95; } }
    }
  `;
  document.head.appendChild(css);

  const crt = document.createElement('div');
  crt.id = 'crt';
  crt.setAttribute('aria-hidden', 'true');
  document.body.appendChild(crt);

  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) {
    const cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    Object.assign(cv.style, { position: 'fixed', inset: '0', zIndex: '0', pointerEvents: 'none', opacity: '0.16' });
    document.body.prepend(cv);
    const ctx = cv.getContext('2d');
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789*+<>{}=';
    const size = 16;
    let drops = [];
    const resize = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
      drops = Array.from({ length: Math.ceil(cv.width / size) }, () => Math.random() * (cv.height / size));
    };
    resize();
    window.addEventListener('resize', resize);
    setInterval(() => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.font = `${size}px monospace`;
      drops.forEach((y, i) => {
        ctx.fillStyle = Math.random() < 0.03 ? '#7DFF9E' : '#00D436';
        ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * size, y * size);
        drops[i] = y * size > cv.height && Math.random() > 0.975 ? 0 : y + 1;
      });
    }, 55);
  }
}
