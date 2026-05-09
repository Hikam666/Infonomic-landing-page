/* ═══════════════════════════════════════════════
   infonomic.id — main.js
   ═══════════════════════════════════════════════ */

'use strict';

/* ── Config ──────────────────────────────────────
   Edit values here to update stats on the page.
   ─────────────────────────────────────────────── */
const STATS = {
  followers: 1700,   // raw number — displayed as e.g. 12.4K+
  anggota:   200,
};

/* ── Utility: animated counter ───────────────── */
/**
 * Counts from 0 up to `target` over `duration` ms.
 * Values ≥ 1000 are shown as "x.xK+" for readability.
 *
 * @param {HTMLElement} el        - element to update
 * @param {number}      target    - final value
 * @param {number}      duration  - animation duration in ms
 */
function countUp(el, target, duration) {
  const steps    = 60;
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

/* ── Init stats when page loads ─────────────── */
function initStats() {
  const elFollowers = document.getElementById('stat-followers');
  const elAnggota   = document.getElementById('stat-anggota');
  const elKonten    = document.getElementById('stat-konten');

  // delay matches the CSS animation-delay on .stat-strip (1.1s + some buffer)
  const DELAY = 1400;

  setTimeout(() => {
    countUp(elFollowers, STATS.followers, 1500);
    countUp(elAnggota,   STATS.anggota,   1500);
    countUp(elKonten,    STATS.konten,    1500);
  }, DELAY);
}

/* ── Ticker pause on hover ───────────────────── */
function initTicker() {
  const ticker = document.getElementById('ticker');
  if (!ticker) return;

  ticker.addEventListener('mouseenter', () => {
    ticker.style.animationPlayState = 'paused';
  });

  ticker.addEventListener('mouseleave', () => {
    ticker.style.animationPlayState = 'running';
  });
}

/* ── Scroll-reveal for contact section ──────── */
function initScrollReveal() {
  const contactSection = document.querySelector('.contact-section');
  if (!contactSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  observer.observe(contactSection);
}

/* light mode removed: theme toggle JS omitted */

/* ── Boot ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initStats();
  initTicker();
  initScrollReveal();
});
