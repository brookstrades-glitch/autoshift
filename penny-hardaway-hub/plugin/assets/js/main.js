/* ===========================================
   PENNY HARDAWAY BRAND HUB — Main JS
   GSAP 3 + Lenis smooth scroll + interactions
   =========================================== */

(function () {
    'use strict';

    // Register GSAP plugin
    gsap.registerPlugin(ScrollTrigger);

    // ── Lenis smooth scroll ──────────────────────────────────────────────────
    const lenis = new Lenis({
        duration:    1.4,
        easing:      (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth:      true,
        smoothTouch: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // ── Film grain canvas ────────────────────────────────────────────────────
    (function initGrain() {
        const canvas = document.createElement('canvas');
        canvas.id = 'ph-grain';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let w, h, tick = 0;

        function resize() {
            w = canvas.width  = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        function draw() {
            tick++;
            if (tick % 2 !== 0) { requestAnimationFrame(draw); return; } // 30fps grain
            const img = ctx.createImageData(w, h);
            const d   = img.data;
            for (let i = 0; i < d.length; i += 4) {
                const v = (Math.random() * 255) | 0;
                d[i] = d[i+1] = d[i+2] = v;
                d[i+3] = 22;
            }
            ctx.putImageData(img, 0, 0);
            requestAnimationFrame(draw);
        }
        draw();
    })();

    // ── Sticky nav scroll state ──────────────────────────────────────────────
    (function initNav() {
        const nav = document.getElementById('ph-nav');
        if (!nav) return;
        lenis.on('scroll', ({ scroll }) => {
            nav.classList.toggle('scrolled', scroll > 80);
        });
    })();

    // ── Scroll-triggered reveals ─────────────────────────────────────────────
    (function initReveals() {
        // Single element fade-up
        gsap.utils.toArray('.ph-reveal').forEach((el) => {
            gsap.fromTo(el,
                { opacity: 0, y: 28 },
                {
                    opacity: 1, y: 0,
                    duration: 0.9,
                    ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true },
                }
            );
        });

        // Staggered children
        gsap.utils.toArray('.ph-reveal-group').forEach((group) => {
            gsap.fromTo(group.querySelectorAll(':scope > *'),
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0,
                    duration: 0.75,
                    ease: 'power3.out',
                    stagger: 0.11,
                    scrollTrigger: { trigger: group, start: 'top 86%', once: true },
                }
            );
        });

        // Text line wipe
        gsap.utils.toArray('.ph-line-reveal span').forEach((span) => {
            gsap.fromTo(span,
                { y: '105%' },
                {
                    y: '0%',
                    duration: 1.05,
                    ease: 'power4.out',
                    scrollTrigger: { trigger: span, start: 'top 92%', once: true },
                }
            );
        });
    })();

    // ── Parallax images ──────────────────────────────────────────────────────
    (function initParallax() {
        gsap.utils.toArray('.ph-parallax-img').forEach((img) => {
            gsap.to(img, {
                yPercent: -12,
                ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.ph-parallax-wrap') || img,
                    start:   'top bottom',
                    end:     'bottom top',
                    scrub:   true,
                },
            });
        });
    })();

    // ── Magnetic buttons ────────────────────────────────────────────────────
    (function initMagnetic() {
        document.querySelectorAll('.ph-magnetic').forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - r.left - r.width  / 2;
                const y = e.clientY - r.top  - r.height / 2;
                gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: 'power2.out' });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.5)' });
            });
        });
    })();

    // ── Video modal ──────────────────────────────────────────────────────────
    (function initVideoModal() {
        const modal      = document.getElementById('ph-video-modal');
        const closeBtn   = document.getElementById('ph-modal-close');
        const iframeWrap = document.getElementById('ph-modal-iframe-wrap');
        if (!modal) return;

        document.querySelectorAll('[data-video-id]').forEach((trigger) => {
            trigger.addEventListener('click', openModal);
            trigger.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openModal.call(trigger); });

            function openModal() {
                const id = trigger.dataset.videoId;
                iframeWrap.innerHTML =
                    '<iframe src="https://www.youtube.com/embed/' + id +
                    '?autoplay=1&controls=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>';
                modal.classList.add('is-open');
                lenis.stop();
                document.body.style.overflow = 'hidden';
                closeBtn && closeBtn.focus();
            }
        });

        function closeModal() {
            modal.classList.remove('is-open');
            iframeWrap.innerHTML = '';
            lenis.start();
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });
    })();

    // ── Inquiry form AJAX ────────────────────────────────────────────────────
    (function initForm() {
        const form = document.getElementById('ph-inquiry-form');
        if (!form) return;

        const statusEl = form.querySelector('.ph-form-status');
        const submitBtn = form.querySelector('[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            const data = new FormData(form);
            data.set('action', 'penny_hub_inquiry');
            data.set('nonce',  pennyHub.nonce);

            try {
                const res  = await fetch(pennyHub.ajaxUrl, { method: 'POST', body: data });
                const json = await res.json();
                statusEl.className    = 'ph-form-status ' + (json.success ? 'success' : 'error');
                statusEl.textContent  = json.data.message;
                if (json.success) form.reset();
            } catch (_) {
                statusEl.className   = 'ph-form-status error';
                statusEl.textContent = 'An unexpected error occurred. Please try again.';
            } finally {
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Submit Inquiry';
            }
        });
    })();

    // ── Smooth anchor links ──────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            lenis.scrollTo(target, { offset: -80, duration: 1.6 });
        });
    });

})();
