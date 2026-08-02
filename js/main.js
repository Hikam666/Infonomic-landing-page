/* ═══════════════════════════════════════════════
   infonomic.id — main.js
   Stats, scroll reveals, lightbox, motion
   (Market ticker: TradingView embed di index.html)
   ═══════════════════════════════════════════════ */

'use strict';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Config ──────────────────────────────────── */
const STATS = {
  followers: 1700,
  anggota: 200,
};

/* ── Utility: animated counter ───────────────── */
function countUp(el, target, duration) {
  if (!el) return;

  if (prefersReducedMotion()) {
    el.textContent =
      target >= 1000
        ? (target / 1000).toFixed(1) + 'K+'
        : target.toLocaleString('id-ID');
    return;
  }

  const steps = 60;
  const interval = duration / steps;
  const increment = target / steps;
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    const rounded = Math.floor(current);
    if (target >= 1000) {
      el.textContent = (rounded / 1000).toFixed(1) + 'K+';
    } else {
      el.textContent = rounded.toLocaleString('id-ID');
    }
  }, interval);
}

function initStats() {
  const elFollowers = document.getElementById('stat-followers');
  const elAnggota = document.getElementById('stat-anggota');
  if (!elFollowers && !elAnggota) return;

  const DELAY = prefersReducedMotion() ? 0 : 1400;
  setTimeout(() => {
    countUp(elFollowers, STATS.followers, 1500);
    countUp(elAnggota, STATS.anggota, 1500);
  }, DELAY);
}

/* ── Generic IntersectionObserver reveal ─────── */
function observeReveal(selector, options = {}) {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    },
    {
      threshold: options.threshold ?? 0.15,
      rootMargin: options.rootMargin ?? '0px 0px -6% 0px',
    }
  );

  els.forEach((el) => observer.observe(el));
}

function initScrollReveal() {
  observeReveal('.contact-section');
  observeReveal('.scroll-reveal');
  observeReveal('.rooms-grid', { threshold: 0.12 });
  observeReveal('.screenshots-grid');

  // Gallery items with stagger index — also observe the grid as a group
  const items = document.querySelectorAll('.gallery-item');
  items.forEach((item, i) => {
    item.style.setProperty('--stagger', String(i));
  });
  observeReveal('.gallery-grid', { threshold: 0.08, rootMargin: '0px 0px -2% 0px' });
  observeReveal('.gallery-item', { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
}

/* ── Hero line reveal (if not pre-marked) ─────── */
function initLineReveal() {
  document.querySelectorAll('[data-line-reveal]').forEach((title) => {
    if (title.classList.contains('line-reveal-title')) return;
    // Already structured in HTML for main heroes
  });
}

/* ── Parallax glow following pointer ─────────── */
function initParallaxGlow() {
  if (prefersReducedMotion()) return;

  const pairs = [
    { host: document.querySelector('.hero'), glow: document.querySelector('.hero .glow') },
    { host: document.querySelector('.kom-hero'), glow: document.querySelector('.kom-hero-glow') },
  ];

  pairs.forEach(({ host, glow }) => {
    if (!host || !glow) return;

    host.addEventListener('pointermove', (e) => {
      const rect = host.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const mx = x * 36;
      const my = y * 28;

      if (glow.classList.contains('glow')) {
        glow.style.transform = `translate(calc(-50% + ${mx}px), calc(-55% + ${my}px))`;
      } else {
        glow.style.transform = `translate(calc(-50% + ${mx}px), ${my * 0.4}px)`;
      }
    });

    host.addEventListener('pointerleave', () => {
      if (glow.classList.contains('glow')) {
        glow.style.transform = 'translate(-50%, -55%)';
      } else {
        glow.style.transform = 'translateX(-50%)';
      }
    });
  });
}

/* ── Magnetic lift on link items ─────────────── */
function initMagneticLinks() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll('.link-item').forEach((link) => {
    link.addEventListener('pointermove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.classList.add('is-magnetic');
      link.style.transform = `translate(${x * 0.06}px, ${y * 0.12 - 2}px)`;
    });

    link.addEventListener('pointerleave', () => {
      link.classList.remove('is-magnetic');
      link.style.transform = '';
    });
  });
}

/* ── Gallery lightbox ────────────────────────── */
function initLightbox() {
  const items = Array.from(
    document.querySelectorAll('.gallery-item img, .history-card-media img')
  );
  if (!items.length) return;

  let lightbox = document.getElementById('lightbox');
  if (!lightbox) {
    lightbox = document.createElement('div');
    lightbox.id = 'lightbox';
    lightbox.className = 'lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Preview gambar');
    lightbox.innerHTML = `
      <div class="lightbox-inner">
        <button type="button" class="lightbox-close" aria-label="Tutup">&times;</button>
        <button type="button" class="lightbox-nav lightbox-prev" aria-label="Sebelumnya">&#8249;</button>
        <img class="lightbox-img" alt="" />
        <button type="button" class="lightbox-nav lightbox-next" aria-label="Berikutnya">&#8250;</button>
        <p class="lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(lightbox);
  }

  const imgEl = lightbox.querySelector('.lightbox-img');
  const captionEl = lightbox.querySelector('.lightbox-caption');
  const btnClose = lightbox.querySelector('.lightbox-close');
  const btnPrev = lightbox.querySelector('.lightbox-prev');
  const btnNext = lightbox.querySelector('.lightbox-next');
  let index = 0;

  function open(i) {
    index = (i + items.length) % items.length;
    const srcImg = items[index];
    imgEl.src = srcImg.currentSrc || srcImg.src;
    imgEl.alt = srcImg.alt || '';
    captionEl.textContent = srcImg.alt || '';
    lightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    btnClose.focus();
  }

  function close() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
    imgEl.removeAttribute('src');
  }

  function next(delta) {
    open(index + delta);
  }

  items.forEach((img, i) => {
    const item = img.closest('.gallery-item, .history-card') || img;
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => open(i));
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Perbesar: ${img.alt || 'gambar'}`);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open(i);
      }
    });
  });

  btnClose.addEventListener('click', close);
  btnPrev.addEventListener('click', (e) => {
    e.stopPropagation();
    next(-1);
  });
  btnNext.addEventListener('click', (e) => {
    e.stopPropagation();
    next(1);
  });

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') next(-1);
    if (e.key === 'ArrowRight') next(1);
  });
}

/* ── Page transition (internal links) ────────── */
function initPageTransition() {
  let overlay = document.getElementById('page-transition');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'page-transition';
    overlay.className = 'page-transition';
    overlay.setAttribute('aria-hidden', 'true');
    document.body.appendChild(overlay);
  }

  // Fade in page on load
  requestAnimationFrame(() => {
    overlay.classList.remove('is-active', 'is-enter');
  });

  if (prefersReducedMotion()) return;

  const internal = document.querySelectorAll(
    'a[href$=".html"], a[href="index.html"], a[href="./"], a[href="/"]'
  );

  internal.forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || a.target === '_blank' || href.startsWith('http') || href.startsWith('mailto:')) {
      return;
    }

    a.addEventListener('click', (e) => {
      // allow modified clicks
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      overlay.classList.add('is-active');
      setTimeout(() => {
        window.location.href = href;
      }, 320);
    });
  });
}

/* ── TradingView embeds (JSON config via JS → no editor false errors) ── */
const TV_TICKER_TAPE =
  'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
const TV_MARKET_OVERVIEW =
  'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';

const TV_WIDGETS = {
  'ticker-stocks': {
    src: TV_TICKER_TAPE,
    config: {
      symbols: [
        { proName: 'IDX:BBCA', title: 'BBCA' },
        { proName: 'IDX:BBRI', title: 'BBRI' },
        { proName: 'IDX:BMRI', title: 'BMRI' },
        { proName: 'IDX:BBNI', title: 'BBNI' },
        { proName: 'IDX:TLKM', title: 'TLKM' },
        { proName: 'IDX:ASII', title: 'ASII' },
        { proName: 'IDX:GOTO', title: 'GOTO' },
        { proName: 'IDX:AMRT', title: 'AMRT' },
        { proName: 'IDX:UNVR', title: 'UNVR' },
        { proName: 'IDX:ICBP', title: 'ICBP' },
        { proName: 'IDX:ADRO', title: 'ADRO' },
        { proName: 'IDX:MDKA', title: 'MDKA' },
        { proName: 'IDX:BRIS', title: 'BRIS' },
        { proName: 'IDX:ANTM', title: 'ANTM' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'id',
    },
  },
  'ticker-crypto': {
    src: TV_TICKER_TAPE,
    config: {
      symbols: [
        { proName: 'BINANCE:BTCUSDT', title: 'BTC' },
        { proName: 'BINANCE:ETHUSDT', title: 'ETH' },
        { proName: 'BINANCE:BNBUSDT', title: 'BNB' },
        { proName: 'BINANCE:SOLUSDT', title: 'SOL' },
        { proName: 'BINANCE:XRPUSDT', title: 'XRP' },
        { proName: 'BINANCE:DOGEUSDT', title: 'DOGE' },
        { proName: 'BINANCE:ADAUSDT', title: 'ADA' },
        { proName: 'BINANCE:AVAXUSDT', title: 'AVAX' },
        { proName: 'BINANCE:DOTUSDT', title: 'DOT' },
        { proName: 'BINANCE:LINKUSDT', title: 'LINK' },
        { proName: 'BINANCE:POLUSDT', title: 'POL' },
        { proName: 'BINANCE:TONUSDT', title: 'TON' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'id',
    },
  },
  'market-overview': {
    src: TV_MARKET_OVERVIEW,
    config: {
      colorTheme: 'dark',
      dateRange: '1D',
      showChart: true,
      locale: 'id',
      width: '100%',
      height: '420',
      largeChartUrl: '',
      isTransparent: true,
      showSymbolLogo: true,
      showFloatingTooltip: false,
      plotLineColorGrowing: 'rgba(201, 168, 76, 1)',
      plotLineColorFalling: 'rgba(181, 55, 42, 1)',
      gridLineColor: 'rgba(201, 168, 76, 0.12)',
      scaleFontColor: 'rgba(245, 240, 232, 0.55)',
      belowLineFillColorGrowing: 'rgba(201, 168, 76, 0.12)',
      belowLineFillColorFalling: 'rgba(181, 55, 42, 0.12)',
      belowLineFillColorGrowingBottom: 'rgba(201, 168, 76, 0)',
      belowLineFillColorFallingBottom: 'rgba(181, 55, 42, 0)',
      symbolActiveColor: 'rgba(201, 168, 76, 0.12)',
      tabs: [
        {
          title: 'Live',
          symbols: [
            { s: 'IDX:COMPOSITE', d: 'IHSG' },
            { s: 'FX_IDC:USDIDR', d: 'USD/IDR' },
            { s: 'OANDA:XAUUSD', d: 'XAU' },
            { s: 'BINANCE:BTCUSDT', d: 'BTC' },
          ],
          originalTitle: 'Live',
        },
      ],
    },
  },
};

function mountTradingViewWidget(container, src, config) {
  if (!container || container.dataset.tvMounted === '1') return;
  container.dataset.tvMounted = '1';

  if (!container.querySelector('.tradingview-widget-container__widget')) {
    const slot = document.createElement('div');
    slot.className = 'tradingview-widget-container__widget';
    container.appendChild(slot);
  }

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  // TradingView reads document.currentScript.innerHTML via JSON.parse
  script.text = JSON.stringify(config);
  script.src = src;
  container.appendChild(script);
}

function initTradingViewWidgets() {
  document.querySelectorAll('[data-tv-widget]').forEach((el) => {
    const key = el.getAttribute('data-tv-widget');
    const def = TV_WIDGETS[key];
    if (!def) return;
    mountTradingViewWidget(el, def.src, def.config);
  });
}

/* ── Mobile site nav ─────────────────────────── */
function initSiteNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('site-nav-menu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Buka menu');
  };

  const openMenu = () => {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Tutup menu');
  };

  toggle.addEventListener('click', () => {
    if (menu.classList.contains('is-open')) closeMenu();
    else openMenu();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

/* ── Boot ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initSiteNav();
  initTradingViewWidgets();
  initStats();
  initScrollReveal();
  initLineReveal();
  initParallaxGlow();
  initMagneticLinks();
  initLightbox();
  initPageTransition();
});
