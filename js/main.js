/* Ámbar — interacciones y animaciones (sin dependencias) */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const body = document.body;

  /* ---------- Split text en palabras y letras ---------- */
  $$('[data-split]').forEach(el => {
    let i = 0;
    const words = el.textContent.trim().split(/\s+/);
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map(w =>
      `<span class="w" aria-hidden="true">${[...w].map(ch => `<span class="c" style="--i:${i++}">${ch}</span>`).join('')}</span>`
    ).join(' ');
  });

  /* ---------- Preloader ---------- */
  const loaderNum = $('[data-count-loader]');
  const loaderWord = $('.preloader__word');
  const heroLines = $$('.hero__title [data-split]');
  heroLines.forEach((l, k) => l.style.setProperty('--d', `${0.35 + k * 0.28}s`));

  const finishLoading = () => {
    body.classList.add('is-loaded');
    body.classList.remove('is-loading');
    heroLines.forEach(l => l.classList.add('in'));
  };

  if (reduced) {
    finishLoading();
  } else {
    const dur = 1700, t0 = performance.now();
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    const tick = now => {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      loaderNum.textContent = Math.round(e * 100);
      loaderWord.style.setProperty('--p', `${e * 100}%`);
      if (p < 1) requestAnimationFrame(tick);
      else fontsReady.then(() => setTimeout(finishLoading, 150));
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Reveals al hacer scroll ---------- */
  const revealTargets = $$('[data-reveal], [data-split]:not(.hero__title [data-split]), .pour');
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  revealTargets.forEach(el => io.observe(el));

  /* ---------- Contadores ---------- */
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.counter, suf = el.dataset.suffix || '';
      const dur = reduced ? 0 : 2000, t0 = performance.now();
      const step = now => {
        const p = dur ? clamp((now - t0) / dur, 0, 1) : 1;
        const e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.round(end * e) + suf;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-counter]').forEach(el => countIO.observe(el));

  /* ---------- Carta: pestañas ---------- */
  const tabs = $$('.tabs [data-tab]');
  const ink = $('.tabs__ink');
  const panels = $$('.menu__list');
  panels.forEach(p => $$('li', p).forEach((li, i) => li.style.setProperty('--i', i)));

  const moveInk = btn => {
    ink.style.setProperty('--w', `${btn.offsetWidth}px`);
    ink.style.setProperty('--x', `${btn.offsetLeft - 5}px`);
  };
  const showPanel = (name, animate = true) => {
    panels.forEach(p => {
      const on = p.dataset.panel === name;
      p.classList.toggle('is-active', on);
      p.classList.remove('is-shown');
      if (on && animate) requestAnimationFrame(() => requestAnimationFrame(() => p.classList.add('is-shown')));
    });
  };
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.setAttribute('aria-selected', b === btn));
    moveInk(btn);
    showPanel(btn.dataset.tab);
  }));
  const setInk = () => moveInk($('.tabs [aria-selected="true"]'));
  setInk();
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(setInk);
  addEventListener('resize', setInk);

  const menuIO = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      $('.menu__list.is-active').classList.add('is-shown');
      menuIO.disconnect();
    }
  }, { threshold: 0.15 });
  menuIO.observe($('.menu'));

  /* ---------- Nav móvil ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => {
    if (!nav.classList.contains('is-open')) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }));

  /* ---------- Galería horizontal: medidas ---------- */
  const hs = $('.hscroll');
  const track = $('.hscroll__track');
  const cards = $$('.hcard img');
  let hsTop = 0, hsDist = 0;
  const measure = () => {
    if (reduced) return;
    hsDist = Math.max(0, track.scrollWidth - innerWidth);
    hs.style.setProperty('--h', `${hsDist + innerHeight}px`);
    hsTop = hs.getBoundingClientRect().top + scrollY;
  };
  measure();
  addEventListener('resize', measure);
  addEventListener('load', measure);

  /* ---------- Bucle de scroll ---------- */
  const progress = $('.progress');
  const parallax = $$('[data-speed]');
  const marqueeAnim = $('.marquee__track').getAnimations?.()[0];
  let lastY = scrollY, velocity = 0, ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.setProperty('--s', max > 0 ? y / max : 0);

    nav.classList.toggle('is-scrolled', y > 40);
    if (!nav.classList.contains('is-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);

    if (!reduced) {
      parallax.forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > innerHeight + 200) return;
        const center = r.top + r.height / 2 - innerHeight / 2;
        el.style.translate = `0 ${(-center * +el.dataset.speed).toFixed(1)}px`;
      });

      const p = clamp((y - hsTop) / (hsDist || 1), 0, 1);
      track.style.transform = `translate3d(${-p * hsDist}px,0,0)`;
      cards.forEach((img, i) => {
        const r = img.getBoundingClientRect();
        const d = (r.left + r.width / 2 - innerWidth / 2) / innerWidth;
        img.style.setProperty('--hs', (1 + Math.abs(d) * -0.12 + 0.06).toFixed(3));
      });
    }
    velocity = Math.abs(y - lastY);
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  // El marquee acelera con la velocidad del scroll y vuelve suave a su ritmo
  if (marqueeAnim && !reduced) {
    let rate = 1;
    const loop = () => {
      rate = lerp(rate, 1 + Math.min(velocity, 80) / 12, 0.08);
      velocity *= 0.9;
      marqueeAnim.playbackRate = rate;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Testimonios ---------- */
  const quotes = $$('.quote');
  const dots = $$('.quotes__dots button');
  let qi = 0, qTimer;
  const showQuote = i => {
    qi = (i + quotes.length) % quotes.length;
    quotes.forEach((q, k) => q.classList.toggle('is-active', k === qi));
    dots.forEach((d, k) => {
      d.classList.remove('is-active');
      if (k === qi) { void d.offsetWidth; d.classList.add('is-active'); }
    });
    clearTimeout(qTimer);
    if (!reduced) qTimer = setTimeout(() => showQuote(qi + 1), 6000);
  };
  dots.forEach((d, k) => d.addEventListener('click', () => showQuote(k)));
  const qIO = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) showQuote(qi); else clearTimeout(qTimer);
  }, { threshold: 0.4 });
  qIO.observe($('.quotes'));

  /* ---------- Formulario ---------- */
  const form = $('.form');
  const today = new Date().toISOString().split('T')[0];
  $('#f-date').min = today;
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('.field', form).forEach(f => {
      const input = $('input, select', f);
      f.classList.remove('is-invalid');
      if (!input.checkValidity()) {
        ok = false;
        void f.offsetWidth;
        f.classList.add('is-invalid');
      }
    });
    if (ok) form.classList.add('is-done');
  });

  $('[data-year]').textContent = new Date().getFullYear();

  /* ---------- Solo con puntero fino ---------- */
  if (!finePointer || reduced) return;

  // Cursor personalizado
  const cursor = $('.cursor'), dot = $('.cursor-dot'), label = $('.cursor__label');
  const glow = $('.hero__glow');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    if (cursor.classList.contains('is-hidden')) { cx = mx; cy = my; cursor.classList.remove('is-hidden'); dot.classList.remove('is-hidden'); }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { cursor.classList.add('is-hidden'); dot.classList.add('is-hidden'); });

  $$('a, button, [data-tilt]').forEach(el => {
    el.addEventListener('pointerenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-hover'));
  });
  const withLabel = (els, text) => els.forEach(el => {
    el.addEventListener('pointerenter', () => { label.textContent = text; cursor.classList.add('is-label'); });
    el.addEventListener('pointerleave', () => cursor.classList.remove('is-label'));
  });
  withLabel($$('.hcard'), 'Ver');
  withLabel($$('.menu__list li'), 'Mira');

  // Vista previa flotante de platos
  const preview = $('.menu__preview');
  const previewImg = $('img', preview);
  let px = mx, py = my;
  $$('.menu__list li').forEach(li => {
    const img = new Image(); img.src = li.dataset.img; // precarga
    li.addEventListener('pointerenter', () => {
      previewImg.src = li.dataset.img;
      preview.classList.add('is-on');
    });
    li.addEventListener('pointerleave', () => preview.classList.remove('is-on'));
  });

  const frame = () => {
    cx = lerp(cx, mx, 0.18); cy = lerp(cy, my, 0.18);
    cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    dot.style.transform = `translate3d(${mx}px,${my}px,0)`;

    const vx = mx - px;
    px = lerp(px, mx, 0.12); py = lerp(py, my, 0.12);
    preview.style.setProperty('--px', `${px}px`);
    preview.style.setProperty('--py', `${py}px`);
    preview.style.setProperty('--pr', `${clamp(vx * 0.08, -12, 12)}deg`);

    glow.style.setProperty('--gx', `${cx}px`);
    glow.style.setProperty('--gy', `${cy}px`);
    requestAnimationFrame(frame);
  };
  frame();

  // Botones magnéticos
  $$('[data-magnetic]').forEach(el => {
    el.style.transition += ', translate .5s cubic-bezier(.23,1,.32,1)';
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.3;
      const y = (e.clientY - r.top - r.height / 2) * 0.4;
      el.style.translate = `${x}px ${y}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = '0 0'; });
  });

  // Tarjetas con inclinación 3D y brillo
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--ry', `${(x - 0.5) * 14}deg`);
      card.style.setProperty('--rx', `${(0.5 - y) * 14}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
})();
