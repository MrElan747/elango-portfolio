/* =========================================================
   Elango Palaniyappan — Portfolio V5
   "Bento Minimal" — app.js
   ========================================================= */
(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    /* ---------------- Theme ---------------- */
    function initTheme() {
        const root = document.documentElement;
        const toggle = $('#themeToggle');
        const meta = $('meta[name="theme-color"]');
        const sync = () => meta && meta.setAttribute('content', root.getAttribute('data-theme') === 'dark' ? '#0b0b0c' : '#f3f2ee');
        sync();
        toggle && toggle.addEventListener('click', () => {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('ep-bento-theme', next); } catch (e) { /* storage unavailable */ }
            sync();
        });
    }

    /* ---------------- Navbar: scrolled state, mobile menu, scrollspy, sliding pill ---------------- */
    function initNavbar() {
        const navbar = $('#navbar');
        const menu = $('#navMenu');
        const hamburger = $('#navHamburger');
        const backdrop = $('#navBackdrop');
        const links = $$('.nav__link');
        if (!menu) return;

        const indicator = document.createElement('span');
        indicator.className = 'nav__indicator';
        indicator.setAttribute('aria-hidden', 'true');
        menu.prepend(indicator);

        const moveIndicator = () => {
            const active = $('.nav__link.is-active', menu);
            if (!active) return;
            indicator.style.width = active.offsetWidth + 'px';
            indicator.style.transform = `translateX(${active.offsetLeft}px)`;
        };

        const setMenu = (open) => {
            menu.classList.toggle('is-open', open);
            hamburger && hamburger.classList.toggle('is-open', open);
            hamburger && hamburger.setAttribute('aria-expanded', String(open));
            backdrop && backdrop.classList.toggle('is-open', open);
            document.body.classList.toggle('nav-open', open);
        };
        hamburger && hamburger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
        backdrop && backdrop.addEventListener('click', () => setMenu(false));
        links.forEach(l => l.addEventListener('click', () => setMenu(false)));
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

        const sections = $$('main section[id]');
        let current = '';
        const onScroll = () => {
            navbar && navbar.classList.toggle('is-scrolled', window.scrollY > 8);
            const y = window.scrollY + window.innerHeight * 0.3;
            let next = sections[0] ? sections[0].id : '';
            sections.forEach(s => { if (s.offsetTop <= y) next = s.id; });
            // Last section can be too short to reach the threshold (tolerance covers pending reveal offsets)
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48) next = sections[sections.length - 1].id;
            if (next !== current) {
                current = next;
                links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + current));
                moveIndicator();
            }
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', () => { moveIndicator(); if (window.innerWidth > 900) setMenu(false); });
        onScroll();
        moveIndicator();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveIndicator);
    }

    /* ---------------- Scroll progress + back to top ---------------- */
    function initScrollUI() {
        const bar = $('#scrollProgress');
        const btn = $('#backToTop');
        let ticking = false;
        const update = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight;
            if (bar) bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
            if (btn) btn.classList.toggle('is-visible', window.scrollY > 600);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        update();
        btn && btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' }));
    }

    /* ---------------- Reveal with per-group stagger ---------------- */
    function initReveal() {
        const items = $$('[data-reveal]');
        if (prefersReduced || !('IntersectionObserver' in window)) {
            items.forEach(i => i.classList.add('is-visible'));
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            entries.filter(e => e.isIntersecting).forEach((entry, i) => {
                entry.target.style.setProperty('--d', (i * 70) + 'ms');
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            });
        }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
        items.forEach(i => obs.observe(i));
    }

    /* ---------------- Rotating role word ---------------- */
    function initRotator() {
        const rot = $('#rotator');
        const word = rot && $('.rotator__word', rot);
        if (!word) return;
        const words = ['cloud-native backends', 'ASP.NET Core APIs', 'Azure Functions', 'event-driven systems', 'Angular apps'];
        if (prefersReduced) return;

        const measurer = document.createElement('span');
        measurer.className = 'rotator__word';
        measurer.setAttribute('aria-hidden', 'true');
        measurer.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;';
        rot.appendChild(measurer);
        const widthOf = (text) => { measurer.textContent = text; return measurer.offsetWidth; };

        let i = 0;
        const setWidth = () => { rot.style.width = widthOf(words[i]) + 'px'; };
        setWidth();
        window.addEventListener('resize', setWidth);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(setWidth);

        setInterval(() => {
            i = (i + 1) % words.length;
            word.classList.add('is-out');
            setTimeout(() => {
                word.textContent = words[i];
                setWidth();
                word.classList.remove('is-out');
                word.classList.add('is-enter');
                // Force a frame in the "enter" position before animating in
                requestAnimationFrame(() => requestAnimationFrame(() => word.classList.remove('is-enter')));
            }, 320);
        }, 2600);
    }

    /* ---------------- Counters ---------------- */
    function initCounters() {
        const nums = $$('[data-count]');
        const run = (el) => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || '';
            if (prefersReduced) { el.textContent = target + suffix; return; }
            const dur = 1600, t0 = performance.now();
            const step = (now) => {
                const t = Math.min(1, (now - t0) / dur);
                const e = 1 - Math.pow(1 - t, 4);
                el.textContent = Math.round(target * e) + suffix;
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        };
        if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                obs.unobserve(entry.target);
                run(entry.target);
            });
        }, { threshold: 0.5 });
        nums.forEach(n => obs.observe(n));
    }

    /* ---------------- Live clock (Bangalore) ---------------- */
    function initClock() {
        const el = $('#clock');
        if (!el) return;
        let fmt;
        try {
            fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });
        } catch (e) { return; }
        const tick = () => {
            const [h, m] = fmt.format(new Date()).split(':');
            el.innerHTML = `${h}<span class="clock__colon">:</span>${m}`;
        };
        tick();
        setInterval(tick, 15000);
    }

    /* ---------------- Marquee: duplicate content for a seamless loop ---------------- */
    function initMarquee() {
        $$('.marquee__track').forEach(track => {
            Array.from(track.children).forEach(child => {
                const clone = child.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });
        });
    }

    /* ---------------- Experience accordion ---------------- */
    function initAccordion() {
        $$('.exp__item').forEach(item => {
            const head = $('.exp__head', item);
            head && head.addEventListener('click', () => {
                const open = !item.classList.contains('is-open');
                item.classList.toggle('is-open', open);
                head.setAttribute('aria-expanded', String(open));
            });
        });
    }

    /* ---------------- Tile spotlight ---------------- */
    function initSpotlight() {
        if (!canHover || prefersReduced) return;
        $$('.tile').forEach(tile => {
            tile.addEventListener('pointermove', (e) => {
                const r = tile.getBoundingClientRect();
                tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    }

    /* ---------------- Copy email + toast ---------------- */
    function initCopy() {
        const btn = $('#copyEmail');
        const toast = $('#toast');
        if (!btn) return;
        let timer;
        const showToast = (msg) => {
            if (!toast) return;
            toast.textContent = msg;
            toast.classList.add('is-visible');
            clearTimeout(timer);
            timer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
        };
        btn.addEventListener('click', async () => {
            const email = btn.dataset.email;
            try {
                await navigator.clipboard.writeText(email);
            } catch (e) {
                // Fallback for non-secure contexts
                const ta = document.createElement('textarea');
                ta.value = email; ta.style.position = 'fixed'; ta.style.opacity = '0';
                document.body.appendChild(ta); ta.select();
                try { document.execCommand('copy'); } catch (err) { /* ignore */ }
                ta.remove();
            }
            const label = $('span', btn);
            btn.classList.add('is-copied');
            if (label) label.textContent = 'Copied';
            showToast('Email copied to clipboard ✓');
            setTimeout(() => { btn.classList.remove('is-copied'); if (label) label.textContent = 'Copy'; }, 2000);
        });
    }

    /* ---------------- Year ---------------- */
    function initYear() {
        const y = $('#year');
        if (y) y.textContent = new Date().getFullYear();
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        initNavbar();
        initScrollUI();
        initMarquee();
        initRotator();
        initCounters();
        initClock();
        initAccordion();
        initSpotlight();
        initCopy();
        initYear();
        // Let the first paint settle, then play the intro + reveals
        requestAnimationFrame(() => {
            document.body.classList.add('is-ready');
            initReveal();
        });
    });
})();
