'use strict';


const PHOTOS = [
  { src: 'z7.jpeg', lbl: 'Ice Blue Lanos' },
  { src: 'z5.jpeg', lbl: 'Red Smoke' },
  { src: 'z8.jpeg', lbl: 'Hood Up' },
  { src: 'z4.jpeg', lbl: 'Desert Drift' },
  { src: 'z2.jpeg', lbl: 'City Lights' },
  { src: 'z6.jpeg', lbl: 'Stance' },
  { src: 'z1.jpeg', lbl: 'Lifestyle' },
  { src: 'z3.jpeg', lbl: 'Urban Edge' },
  { src: 'z9.jpeg', lbl: 'Lifestyle' },


];

/* ══════════════════════════════════════════════════
   VIDEO BACKGROUND
   ══════════════════════════════════════════════════ */
const vid = document.getElementById('bgVid');

function tryPlay() {
  if (vid.src || vid.querySelector('source')) {
    vid.play().catch(() => {
      const go = () => {
        vid.play();
        document.removeEventListener('touchstart', go);
        document.removeEventListener('click', go);
      };
      document.addEventListener('touchstart', go, { once: true });
      document.addEventListener('click', go, { once: true });
    });
  }
}
if (vid.readyState >= 2) tryPlay();
else vid.addEventListener('loadeddata', tryPlay, { once: true });
vid.addEventListener('error', () => { });

/* ══════════════════════════════════════════════════
   BUILD GALLERY STRIP
   ══════════════════════════════════════════════════ */
const fTrack = document.getElementById('fTrack');
const PH_W = () => (fTrack.querySelector('.fPh') ? fTrack.querySelector('.fPh').offsetWidth + 8 : 90 + 8);
let TOTAL_W = 0;

function buildStrip() {
  fTrack.innerHTML = '';
  const items = [...PHOTOS, ...PHOTOS];
  items.forEach(p => {
    const ph = document.createElement('div');
    ph.className = 'fPh';
    const fImg = document.createElement('div');
    fImg.className = 'fImg';
    const img = document.createElement('img');
    img.src = p.src;
    img.alt = p.lbl || '';
    img.draggable = false;
    fImg.appendChild(img);
    ph.appendChild(fImg);
    fTrack.appendChild(ph);
    ph.addEventListener('click', () => openModal(p));
    ph.addEventListener('touchend', () => {
      if (!wasDrag) openModal(p);
      wasDrag = false;
    }, { passive: true });
  });
  TOTAL_W = PHOTOS.length * (PH_W());
}

buildStrip();

/* ══════════════════════════════════════════════════
   FILM STRIP — auto-scroll, drag, depth focus
   ══════════════════════════════════════════════════ */
let scrollX = 0;
let isDrag = false;
let wasDrag = false;
let dragSX = 0;
let dragStart = 0;
let velocity = 0.5;

function clampScroll() {
  if (TOTAL_W <= 0) return;
  if (scrollX >= TOTAL_W) scrollX -= TOTAL_W;
  if (scrollX < 0) scrollX += TOTAL_W;
}
function applyScroll() {
  fTrack.style.transform = `translateX(${-scrollX}px)`;
}
function focusDrive() {
  const cx = window.innerWidth / 2;
  fTrack.querySelectorAll('.fPh').forEach(ph => {
    const r = ph.getBoundingClientRect();
    const pcx = r.left + r.width / 2;
    const d = Math.abs(pcx - cx);
    const md = 180;
    const rat = Math.max(0, 1 - d / md);
    const sc = 0.72 + rat * 0.28;
    const op = 0.32 + rat * 0.68;
    const blurPx = rat > 0.3 ? 0 : 6;
    ph.style.transform = `scale(${sc})`;
    ph.style.opacity = op;
    ph.style.filter = `brightness(${0.55 + rat * 0.45}) blur(${blurPx}px)`;
  });
}

/* Touch drag */
const fWrap = document.getElementById('fWrap');
let touchX0 = 0, scrollX0 = 0, moveCount = 0;
fWrap.addEventListener('touchstart', e => {
  isDrag = false; wasDrag = false; moveCount = 0;
  touchX0 = e.touches[0].clientX; scrollX0 = scrollX; velocity = 0;
}, { passive: true });
fWrap.addEventListener('touchmove', e => {
  moveCount++;
  if (moveCount > 2) { isDrag = true; wasDrag = true; }
  scrollX = scrollX0 + (touchX0 - e.touches[0].clientX);
  clampScroll(); applyScroll(); focusDrive();
}, { passive: true });
fWrap.addEventListener('touchend', () => { isDrag = false; velocity = 0.5; });

/* Mouse drag */
fWrap.addEventListener('mousedown', e => {
  isDrag = true; wasDrag = false; dragStart = e.clientX; dragSX = scrollX;
  velocity = 0; e.preventDefault();
});
window.addEventListener('mousemove', e => {
  if (!isDrag) return;
  const dx = dragStart - e.clientX;
  if (Math.abs(dx) > 4) wasDrag = true;
  scrollX = dragSX + dx;
  clampScroll(); applyScroll(); focusDrive();
});
window.addEventListener('mouseup', () => { isDrag = false; velocity = 0.5; });

/* RAF loop */
(function filmLoop() {
  if (!isDrag) { scrollX += velocity; clampScroll(); applyScroll(); }
  focusDrive();
  requestAnimationFrame(filmLoop);
})();

/* ══════════════════════════════════════════════════
   PHOTO MODAL — Professional lightbox
   ══════════════════════════════════════════════════ */
const modal = document.getElementById('modal');
const mImg = document.getElementById('mImg');
const mImgWrap = document.getElementById('mImgWrap');

function openModal(photo) {
  if (photo.src) {
    mImg.src = photo.src;
    mImg.style.display = 'block';
    mImgWrap.style.background = '';
  } else {
    mImg.src = '';
    mImg.style.display = 'none';
    mImgWrap.style.background = photo.gradient || '#111';
  }
  modal.classList.add('open');
}
function closeModal() { modal.classList.remove('open'); }

document.getElementById('mClose').addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

/* Swipe down to close */
let mTouchY = 0;
mImgWrap.addEventListener('touchstart', e => { mTouchY = e.touches[0].clientY; }, { passive: true });
mImgWrap.addEventListener('touchend', e => {
  if (e.changedTouches[0].clientY - mTouchY > 60) closeModal();
}, { passive: true });

/* ESC to close */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ══════════════════════════════════════════════════
   CURSOR (desktop)
   ══════════════════════════════════════════════════ */
const cDot = document.getElementById('cDot');
const cRing = document.getElementById('cRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cDot.style.left = mx + 'px'; cDot.style.top = my + 'px';
});
(function cLoop() {
  rx += (mx - rx) * .11; ry += (my - ry) * .11;
  cRing.style.left = rx + 'px'; cRing.style.top = ry + 'px';
  requestAnimationFrame(cLoop);
})();
function attachCursorHover() {
  document.querySelectorAll('.fPh,.sBtn,#mClose').forEach(el => {
    el.addEventListener('mouseenter', () => cRing.classList.add('on'));
    el.addEventListener('mouseleave', () => cRing.classList.remove('on'));
  });
}
attachCursorHover();

/* ══════════════════════════════════════════════════
   GYROSCOPE + MOUSE PARALLAX
   ══════════════════════════════════════════════════ */
const brand = document.getElementById('brand');
const ghost28 = document.getElementById('ghost28');
let tpx = 0, tpy = 0, cpx = 0, cpy = 0;

function setParallax(x, y) { tpx = x; tpy = y; }

if (window.DeviceOrientationEvent) {
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    document.addEventListener('touchstart', function askPerm() {
      DeviceOrientationEvent.requestPermission().then(s => {
        if (s === 'granted') attachGyro();
      }).catch(() => { });
      document.removeEventListener('touchstart', askPerm);
    }, { once: true });
  } else {
    attachGyro();
  }
}
function attachGyro() {
  window.addEventListener('deviceorientation', e => {
    const gx = Math.min(Math.max(e.gamma || 0, -25), 25) / 25;
    const gy = Math.min(Math.max((e.beta || 45) - 45, -25), 25) / 25;
    setParallax(gx * 16, gy * 11);
  });
}
document.addEventListener('mousemove', e => {
  const px = (e.clientX / window.innerWidth - .5) * 22;
  const py = (e.clientY / window.innerHeight - .5) * 14;
  setParallax(px, py);
});
(function plxLoop() {
  cpx += (tpx - cpx) * .08; cpy += (tpy - cpy) * .08;
  brand.style.transform = `translate(calc(-50% + ${cpx}px),calc(-50% + ${cpy}px))`;
  ghost28.style.transform = `translate(${cpx * .28}px,${cpy * .28}px)`;
  requestAnimationFrame(plxLoop);
})();

/* ══════════════════════════════════════════════════
   SMOKE PARTICLES
   ══════════════════════════════════════════════════ */
const cv = document.getElementById('pCvs');
const ctx = cv.getContext('2d');
function rzCvs() { cv.width = window.innerWidth; cv.height = window.innerHeight; }
rzCvs();
window.addEventListener('resize', rzCvs);

const PARTS = [];
function mkP(ox, oy) {
  return {
    x: ox != null ? ox : Math.random() * cv.width,
    y: oy != null ? oy : cv.height + 8,
    vx: (Math.random() - .5) * .35,
    vy: -(Math.random() * .72 + .28),
    r: Math.random() * 46 + 14,
    a: Math.random() * .22 + .04,
    col: Math.random() > .74 ? [255, 40, 0] : [94, 197, 255],
    life: 0,
    maxL: Math.random() * 148 + 72,
    grow: Math.random() * .28 + .1,
  };
}
for (let i = 0; i < 22; i++) {
  const p = mkP(); p.y = Math.random() * cv.height;
  p.life = Math.floor(Math.random() * p.maxL); PARTS.push(p);
}
let pageVisible = true;
document.addEventListener('visibilitychange', () => { pageVisible = !document.hidden; });
(function pLoop() {
  if (!pageVisible) { requestAnimationFrame(pLoop); return; }
  ctx.clearRect(0, 0, cv.width, cv.height);
  for (let i = PARTS.length - 1; i >= 0; i--) {
    const p = PARTS[i];
    p.life++; p.x += p.vx; p.y += p.vy; p.r += p.grow;
    const lr = p.life / p.maxL;
    let op = p.a;
    if (lr < .2) op *= lr / .2;
    else if (lr > .56) op *= (1 - lr) / .44;
    if (op <= 0) { PARTS.splice(i, 1); PARTS.push(mkP()); continue; }
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, `rgba(${p.col},${op.toFixed(3)})`);
    g.addColorStop(1, `rgba(${p.col},0)`);
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = g; ctx.fill();
  }
  requestAnimationFrame(pLoop);
})();