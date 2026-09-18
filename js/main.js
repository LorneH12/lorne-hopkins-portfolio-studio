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

/* Decorative scroll depth. All text/images are cut out of the foreground mask.
   Gray separators and the blue work section cover the floating rings entirely. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const overlay = document.querySelector('.depth-ornaments');
  if (!overlay) return;
  const cutouts = overlay.querySelector('.content-cutouts');
  const orbits = [...overlay.querySelectorAll('.orbit')];
  const surfaces = [...document.querySelectorAll('.matte-surface')];
  const backRings = [...document.querySelectorAll('.rings .ring')];
  const protectedElements = [...document.querySelectorAll('.site-header, main h1, main h2, main h3, main p, main img, main a, main button, main figcaption, .companies, .testimonials, #work, footer')];
  const ns = 'http://www.w3.org/2000/svg';
  const masks = protectedElements.map(() => {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('rx', '12');
    cutouts.append(rect);
    return rect;
  });
  let pending = false;
  function drawDepth() {
    pending = false;
    const w = innerWidth, h = innerHeight;
    const moving = !reduced.matches;
    const wide = w > 700;
    // Complete all geometry reads before writing styles.
    const protectedRects = wide && moving ? protectedElements.map(el => el.getBoundingClientRect()) : [];
    const surfaceTops = surfaces.map(el => el.parentElement.getBoundingClientRect().top);
    const ringTops = backRings.map(el => el.closest('section').getBoundingClientRect().top);
    surfaces.forEach((el,i) => {
      const offset = moving ? Math.max(-18,Math.min(18,-surfaceTops[i]*.025)) : 0;
      el.style.setProperty('--texture-y', `${offset.toFixed(2)}px`);
    });
    backRings.forEach((el,i) => {
      const max = wide ? 42 : 12;
      const offset = moving ? Math.max(-max,Math.min(max,-ringTops[i]*(.025+(i%3)*.016))) : 0;
      el.style.transform = `translate3d(0,${offset.toFixed(2)}px,0)`;
    });
    overlay.classList.toggle('depth-ready', wide && moving);
    if (!wide || !moving) return;
    overlay.setAttribute('viewBox', `0 0 ${w} ${h}`);
    protectedRects.forEach((r,i) => {
      const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < h;
      const mask = masks[i];
      mask.setAttribute('x', String(r.left-18));
      mask.setAttribute('y', String(r.top-18));
      mask.setAttribute('width', String(visible ? r.width+36 : 0));
      mask.setAttribute('height', String(visible ? r.height+36 : 0));
    });
    const travel = Math.sin(scrollY / Math.max(h,1) * .65);
    const positions = [
      [-w*.052,h*.3-travel*56,Math.min(170,w*.125),Math.min(205,w*.15),-22],
      [w*1.04,h*.64+travel*85,Math.min(150,w*.11),Math.min(185,w*.135),24],
      [-w*.035,h*.86+travel*38,Math.min(108,w*.08),Math.min(125,w*.093),18],
      [w*.975,h*.19-travel*35,Math.min(50,w*.038),Math.min(68,w*.052),-28]
    ];
    orbits.forEach((g,i) => {
      const [x,y,rx,ry,angle] = positions[i];
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${angle+travel*4})`);
      g.querySelectorAll('ellipse').forEach(e => {
        e.setAttribute('rx',String(rx)); e.setAttribute('ry',String(ry));
      });
    });
  }
  function scheduleDepth() {
    if (!pending) { pending = true; requestAnimationFrame(drawDepth); }
  }
  addEventListener('scroll',scheduleDepth,{passive:true});
  addEventListener('resize',scheduleDepth);
  addEventListener('load',scheduleDepth);
  reduced.addEventListener('change',scheduleDepth);
  if ('ResizeObserver' in window) {
    const depthObserver = new ResizeObserver(scheduleDepth);
    document.querySelectorAll('.section-sheet').forEach(el=>depthObserver.observe(el));
  }
  document.fonts.ready.then(scheduleDepth);
  drawDepth();
})();
