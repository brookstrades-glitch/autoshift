/* ===========================================
   PENNY HARDAWAY BRAND HUB — Main JS
   Defensive init: every module is isolated.
   Content is always visible even if CDN fails.
   =========================================== */

(function () {
    'use strict';

    // Don't run inside the Elementor editor
    if ( document.body.classList.contains('elementor-editor-active') ) return;

    // If GSAP didn't load, reveal all content immediately
    var hasGSAP          = typeof gsap         !== 'undefined';
    var hasScrollTrigger = typeof ScrollTrigger !== 'undefined';
    var hasLenis         = typeof Lenis         !== 'undefined';

    if ( ! hasGSAP ) {
        document.querySelectorAll(
            '.ph-reveal, .ph-reveal-group > *, .ph-line-reveal span'
        ).forEach( function(el) {
            el.style.opacity   = '1';
            el.style.transform = 'none';
        });
    } else {
        gsap.registerPlugin( ScrollTrigger );
    }

    // ------------------------------------------------------------------
    // Lenis smooth scroll
    // ------------------------------------------------------------------
    var lenis = null;

    try {
        if ( hasLenis ) {
            lenis = new Lenis({
                duration:    1.4,
                easing:      function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
                smooth:      true,
                smoothTouch: false,
            });
            if ( hasGSAP ) {
                lenis.on('scroll', ScrollTrigger.update);
                gsap.ticker.add(function(t) { lenis.raf(t * 1000); });
                gsap.ticker.lagSmoothing(0);
            } else {
                (function tick(t) { lenis.raf(t); requestAnimationFrame(tick); })(0);
            }
        }
    } catch(e) {
        console.warn('[PH Hub] Lenis failed to init:', e);
    }

    // ------------------------------------------------------------------
    // Film grain canvas
    // ------------------------------------------------------------------
    try {
        var canvas = document.createElement('canvas');
        canvas.id  = 'ph-grain';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);

        var ctx = canvas.getContext('2d');
        var gw, gh, gtick = 0;

        function grainResize() {
            gw = canvas.width  = window.innerWidth;
            gh = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', grainResize);
        grainResize();

        function drawGrain() {
            gtick++;
            if ( gtick % 2 ) { requestAnimationFrame(drawGrain); return; }
            var img = ctx.createImageData(gw, gh), d = img.data;
            for ( var i = 0; i < d.length; i += 4 ) {
                var v = (Math.random() * 255) | 0;
                d[i] = d[i+1] = d[i+2] = v;
                d[i+3] = 22;
            }
            ctx.putImageData(img, 0, 0);
            requestAnimationFrame(drawGrain);
        }
        drawGrain();
    } catch(e) {
        console.warn('[PH Hub] Film grain failed:', e);
    }

    // ------------------------------------------------------------------
    // Sticky nav
    // ------------------------------------------------------------------
    try {
        var nav = document.getElementById('ph-nav');
        if ( nav ) {
            var onScroll = function(payload) {
                var s = payload ? payload.scroll : window.scrollY;
                nav.classList.toggle('scrolled', s > 80);
            };
            if ( lenis ) {
                lenis.on('scroll', onScroll);
            } else {
                window.addEventListener('scroll', function() { onScroll(null); }, { passive: true });
            }
        }
    } catch(e) {
        console.warn('[PH Hub] Nav init failed:', e);
    }

    // ------------------------------------------------------------------
    // Scroll-triggered reveals
    // ------------------------------------------------------------------
    if ( hasGSAP && hasScrollTrigger ) {
        try {
            gsap.utils.toArray('.ph-reveal').forEach(function(el) {
                gsap.fromTo( el,
                    { opacity: 0, y: 28 },
                    { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
                      scrollTrigger: { trigger: el, start: 'top 88%', once: true } }
                );
            });
            gsap.utils.toArray('.ph-reveal-group').forEach(function(group) {
                gsap.fromTo( group.querySelectorAll(':scope > *'),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', stagger: 0.11,
                      scrollTrigger: { trigger: group, start: 'top 86%', once: true } }
                );
            });
            gsap.utils.toArray('.ph-line-reveal span').forEach(function(span) {
                gsap.fromTo( span,
                    { y: '105%' },
                    { y: '0%', duration: 1.05, ease: 'power4.out',
                      scrollTrigger: { trigger: span, start: 'top 92%', once: true } }
                );
            });
        } catch(e) {
            console.warn('[PH Hub] Reveals failed, showing content:', e);
            document.querySelectorAll('.ph-reveal, .ph-reveal-group > *, .ph-line-reveal span')
                .forEach(function(el) { el.style.opacity = '1'; el.style.transform = 'none'; });
        }
    }

    // ------------------------------------------------------------------
    // Parallax
    // ------------------------------------------------------------------
    if ( hasGSAP && hasScrollTrigger ) {
        try {
            gsap.utils.toArray('.ph-parallax-img').forEach(function(img) {
                gsap.to( img, { yPercent: -12, ease: 'none',
                    scrollTrigger: {
                        trigger: img.closest('.ph-parallax-wrap') || img,
                        start: 'top bottom', end: 'bottom top', scrub: true,
                    }
                });
            });
        } catch(e) {
            console.warn('[PH Hub] Parallax failed:', e);
        }
    }

    // ------------------------------------------------------------------
    // Magnetic buttons
    // ------------------------------------------------------------------
    if ( hasGSAP ) {
        try {
            document.querySelectorAll('.ph-magnetic').forEach(function(el) {
                el.addEventListener('mousemove', function(e) {
                    var r = el.getBoundingClientRect();
                    gsap.to(el, {
                        x: (e.clientX - r.left - r.width  / 2) * 0.28,
                        y: (e.clientY - r.top  - r.height / 2) * 0.28,
                        duration: 0.4, ease: 'power2.out',
                    });
                });
                el.addEventListener('mouseleave', function() {
                    gsap.to(el, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.5)' });
                });
            });
        } catch(e) {
            console.warn('[PH Hub] Magnetic buttons failed:', e);
        }
    }

    // ------------------------------------------------------------------
    // Video modal
    // ------------------------------------------------------------------
    try {
        var modal      = document.getElementById('ph-video-modal');
        var closeBtn   = document.getElementById('ph-modal-close');
        var iframeWrap = document.getElementById('ph-modal-iframe-wrap');

        if ( modal && iframeWrap ) {
            document.querySelectorAll('[data-video-id]').forEach(function(trigger) {
                function openModal() {
                    var id = trigger.dataset.videoId;
                    if ( ! id ) return;
                    iframeWrap.innerHTML =
                        '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(id) +
                        '?autoplay=1&controls=1&rel=0&modestbranding=1"' +
                        ' allow="autoplay; encrypted-media" allowfullscreen></iframe>';
                    modal.classList.add('is-open');
                    document.body.style.overflow = 'hidden';
                    if ( lenis ) lenis.stop();
                    if ( closeBtn ) closeBtn.focus();
                }
                trigger.addEventListener('click', openModal);
                trigger.addEventListener('keydown', function(e) {
                    if ( e.key === 'Enter' || e.key === ' ' ) { e.preventDefault(); openModal(); }
                });
            });

            function closeModal() {
                modal.classList.remove('is-open');
                iframeWrap.innerHTML = '';
                document.body.style.overflow = '';
                if ( lenis ) lenis.start();
            }
            if ( closeBtn ) closeBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', function(e) { if ( e.target === modal ) closeModal(); });
            document.addEventListener('keydown', function(e) {
                if ( e.key === 'Escape' && modal.classList.contains('is-open') ) closeModal();
            });
        }
    } catch(e) {
        console.warn('[PH Hub] Video modal failed:', e);
    }

    // ------------------------------------------------------------------
    // Pilot form — no submission, show notice on click
    // ------------------------------------------------------------------
    try {
        document.querySelectorAll('.ph-form[data-pilot-notice]').forEach(function(form) {
            var statusEl  = form.querySelector('.ph-form-status');
            var submitBtn = form.querySelector('[type="submit"]');
            var notice    = form.dataset.pilotNotice;

            form.addEventListener('submit', function(e) {
                e.preventDefault();
                if ( statusEl ) {
                    statusEl.className   = 'ph-form-status success';
                    statusEl.textContent = notice;
                }
                if ( submitBtn ) submitBtn.disabled = true;
            });
        });
    } catch(e) {
        console.warn('[PH Hub] Form init failed:', e);
    }

    // ------------------------------------------------------------------
    // Smooth anchor links
    // ------------------------------------------------------------------
    try {
        document.querySelectorAll('a[href^="#"]').forEach(function(link) {
            link.addEventListener('click', function(e) {
                var target = document.querySelector(link.getAttribute('href'));
                if ( ! target ) return;
                e.preventDefault();
                if ( lenis ) {
                    lenis.scrollTo(target, { offset: -80, duration: 1.6 });
                } else {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    } catch(e) {
        console.warn('[PH Hub] Anchor links failed:', e);
    }

})();
