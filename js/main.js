/* Navigation, keyboard-accessible work tabs and section-only overlap. */
'use strict';
document.documentElement.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
function closeMenu() {
  menu.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menu.focus();
  }
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  closeMenu();
  const section = document.querySelector(link.hash);
  if (section) {
    section.setAttribute('tabindex', '-1');
    section.focus({preventScroll: true});
  }
}));

/* Each tab's data-panel names the matching panel ID in index.html. */
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activate(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.dataset.panel).hidden = !selected;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      activate(tabs[next]);
      tabs[next].focus();
    }
  });
});

/* Whole sections pin for 40–80px. No transforms on portraits, laptops,
   rings or text. Tall sections can scroll fully before the overlap starts. */
const sheets = [...document.querySelectorAll('.section-sheet')];
const sections = [...document.querySelectorAll('main section[id]')];
const header = document.querySelector('.site-header');
function measureSections() {
  const overlap = Math.min(80, Math.max(40, innerHeight * 0.075));
  document.documentElement.style.setProperty('--overlap', `${overlap}px`);
  sheets.forEach(sheet => {
    const pinTop = Math.min(header.offsetHeight, innerHeight - sheet.offsetHeight);
    sheet.style.setProperty('--pin-top', `${pinTop}px`);
  });
}
let queued = false;
function updateNavigation() {
  queued = false;
  let current = sections[0].id;
  sections.forEach(section => {
    if (section.getBoundingClientRect().top <= header.offsetHeight + innerHeight * 0.3) current = section.id;
  });
  nav.querySelectorAll('a').forEach(link => {
    if (link.hash === `#${current}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}
addEventListener('scroll', () => {
  if (!queued) { queued = true; requestAnimationFrame(updateNavigation); }
}, {passive: true});
addEventListener('resize', () => {
  if (innerWidth > 700) closeMenu();
  measureSections();
  updateNavigation();
});
if ('ResizeObserver' in window) {
  const observer = new ResizeObserver(measureSections);
  sheets.forEach(sheet => observer.observe(sheet));
}
addEventListener('load', measureSections);
measureSections();
updateNavigation();

/* Start immediately; reveal only after the portrait is decoded.
   A slow or failed request never blocks navigation or the rest of the page. */
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('hero-intro')) return;
  const portrait = document.querySelector('.hero-person img');
  const minimumIntro = new Promise(resolve => setTimeout(resolve, 950));
  const ready = portrait.decode ? portrait.decode() : new Promise((resolve, reject) => {
    if (portrait.complete) return portrait.naturalWidth ? resolve() : reject();
    portrait.addEventListener('load', resolve, {once:true});
    portrait.addEventListener('error', reject, {once:true});
  });
  Promise.all([ready, minimumIntro]).then(() => {
    root.classList.add('hero-ready');
    setTimeout(() => root.classList.remove('hero-intro', 'hero-ready'), 650);
  }).catch(() => root.classList.remove('hero-intro', 'hero-ready'));
})();
