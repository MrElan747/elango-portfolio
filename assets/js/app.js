/* =========================================================
   Elango Palaniyappan — Portfolio V3
   Motorized & Animated — app.js
   ========================================================= */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ---------------- Preloader ---------------- */
    function initPreloader() {
        const loader = $('#preloader');
        const fill = $('#preloaderFill');
        const percent = $('#preloaderPercent');
        if (!loader) return;

        let p = 0;
        const tick = setInterval(() => {
            p += Math.random() * 18 + 6;
            if (p >= 100) { p = 100; clearInterval(tick); }
            if (fill) fill.style.width = p + '%';
            if (percent) percent.textContent = Math.floor(p) + '%';
            if (p === 100) {
                setTimeout(() => {
                    loader.classList.add('is-done');
                    document.body.style.overflow = '';
                    startReveals();
                }, 350);
            }
        }, 140);

        document.body.style.overflow = 'hidden';
    }

    /* ---------------- Theme Toggle ---------------- */
    function initTheme() {
        const toggle = $('#themeToggle');
        const root = document.documentElement;
        const saved = localStorage.getItem('ep-theme');
        if (saved) root.setAttribute('data-theme', saved);

        toggle && toggle.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            localStorage.setItem('ep-theme', next);
        });
    }

    /* ---------------- Navbar ---------------- */
    function initNavbar() {
        const navbar = $('#navbar');
        const hamburger = $('#navHamburger');
        const menu = $('#navMenu');
        const links = $$('.nav__link');

        const onScroll = () => {
            navbar && navbar.classList.toggle('is-scrolled', window.scrollY > 40);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        hamburger && hamburger.addEventListener('click', () => {
            const open = menu.classList.toggle('is-open');
            hamburger.classList.toggle('is-open', open);
            hamburger.setAttribute('aria-expanded', String(open));
        });

        links.forEach(link => link.addEventListener('click', () => {
            menu && menu.classList.remove('is-open');
            hamburger && hamburger.classList.remove('is-open');
        }));

        // Scrollspy
        const sections = $$('main section[id]');
        const spy = () => {
            const y = window.scrollY + 120;
            let current = sections[0] ? sections[0].id : '';
            sections.forEach(s => { if (s.offsetTop <= y) current = s.id; });
            links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current));
        };
        window.addEventListener('scroll', spy, { passive: true });
        spy();
    }

    /* ---------------- Scroll Progress ---------------- */
    function initScrollProgress() {
        const bar = $('#scrollProgress');
        if (!bar) return;
        const update = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
        };
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* ---------------- Back To Top ---------------- */
    function initBackToTop() {
        const btn = $('#backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('is-visible', window.scrollY > 600);
        }, { passive: true });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    /* ---------------- Typing Effect ---------------- */
    function initTyping() {
        const el = $('#typed');
        if (!el) return;
        const words = ['high-performance APIs', '.NET Core 8 systems', 'Angular SPAs', 'scalable backends', 'IoT solutions'];
        if (prefersReduced) { el.textContent = words[0]; return; }

        let wi = 0, ci = 0, deleting = false;
        function loop() {
            const word = words[wi];
            el.textContent = word.slice(0, ci);
            if (!deleting && ci < word.length) { ci++; setTimeout(loop, 80); }
            else if (deleting && ci > 0) { ci--; setTimeout(loop, 40); }
            else {
                if (!deleting) { deleting = true; setTimeout(loop, 1600); }
                else { deleting = false; wi = (wi + 1) % words.length; setTimeout(loop, 300); }
            }
        }
        loop();
    }

    /* ---------------- Scroll Reveal ---------------- */
    let revealObserver;
    function initReveal() {
        const items = $$('[data-reveal]');
        if (prefersReduced) { items.forEach(i => i.classList.add('is-visible')); return; }
        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, i) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('is-visible'), i * 70);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        items.forEach(i => revealObserver.observe(i));
    }
    function startReveals() {
        // Reveal anything already in view after preloader
        $$('[data-reveal]').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.92) el.classList.add('is-visible');
        });
    }

    /* ---------------- Counters ---------------- */
    function initCounters() {
        const nums = $$('[data-count]');
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                if (prefersReduced) { el.textContent = target + suffix; obs.unobserve(el); return; }
                let cur = 0;
                const step = Math.max(1, target / 40);
                const run = () => {
                    cur += step;
                    if (cur >= target) { el.textContent = target + suffix; }
                    else { el.textContent = Math.floor(cur) + suffix; requestAnimationFrame(run); }
                };
                run();
                obs.unobserve(el);
            });
        }, { threshold: 0.6 });
        nums.forEach(n => obs.observe(n));
    }

    /* ---------------- Custom Cursor ---------------- */
    function initCursor() {
        const dot = $('#cursorDot');
        const ring = $('#cursorRing');
        if (!dot || !ring || window.matchMedia('(hover: none)').matches) return;

        let mx = 0, my = 0, rx = 0, ry = 0;
        window.addEventListener('mousemove', (e) => {
            mx = e.clientX; my = e.clientY;
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
        });
        const render = () => {
            rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(render);
        };
        render();

        const hoverables = 'a, button, .chip, .project-card, .stat-card, .contact-card, .skill-cat';
        $$(hoverables).forEach(el => {
            el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
            el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
        });
    }

    /* ---------------- Card Tilt + Glow ---------------- */
    function initTilt() {
        if (prefersReduced) return;
        $$('[data-tilt]').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const r = card.getBoundingClientRect();
                const x = e.clientX - r.left, y = e.clientY - r.top;
                const rotX = ((y / r.height) - 0.5) * -8;
                const rotY = ((x / r.width) - 0.5) * 8;
                card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
                card.style.setProperty('--mx', x + 'px');
                card.style.setProperty('--my', y + 'px');
            });
            card.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }

    /* ---------------- Hero Parallax ---------------- */
    function initParallax() {
        if (prefersReduced) return;
        const orb = $('.hero__orb');
        const hero = $('.hero');
        if (!orb || !hero) return;
        hero.addEventListener('mousemove', (e) => {
            const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
            orb.style.transform = `translate(${dx * 18}px, ${dy * 18}px)`;
        });
        hero.addEventListener('mouseleave', () => { orb.style.transform = ''; });
    }

    /* ---------------- Particle Background ---------------- */
    function initParticles() {
        const canvas = $('#bgCanvas');
        if (!canvas || prefersReduced) return;
        const ctx = canvas.getContext('2d');
        let w, h, particles = [], raf;
        const COUNT = window.innerWidth < 768 ? 36 : 70;

        function resize() {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        function make() {
            particles = Array.from({ length: COUNT }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.8 + 0.6
            }));
        }
        function draw() {
            ctx.clearRect(0, 0, w, h);
            const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#6c5ce7';
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = accent;
                ctx.globalAlpha = 0.5;
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j];
                    const dx = p.x - q.x, dy = p.y - q.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
                        ctx.strokeStyle = accent;
                        ctx.globalAlpha = (1 - dist / 120) * 0.18;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            ctx.globalAlpha = 1;
            raf = requestAnimationFrame(draw);
        }
        resize(); make(); draw();
        window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); make(); draw(); });
    }

    /* ---------------- Year ---------------- */
    function initYear() {
        const y = $('#year');
        if (y) y.textContent = new Date().getFullYear();
    }

    /* ---------------- Init ---------------- */
    document.addEventListener('DOMContentLoaded', () => {
        initPreloader();
        initTheme();
        initNavbar();
        initScrollProgress();
        initBackToTop();
        initTyping();
        initReveal();
        initCounters();
        initCursor();
        initTilt();
        initParallax();
        initParticles();
        initYear();
    });
})();
