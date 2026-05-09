# Penny Hardaway Brand Hub

Cinematic one-page brand hub built on WP Engine · WordPress · Elementor Pro.

All editable content (text, images, video, venture cards) is managed through Elementor Pro's controls panel — no code editing required for day-to-day updates.

---

## Repo structure

```
penny-hardaway-hub/
├── plugin/                   WordPress plugin — install & activate
│   ├── penny-hardaway-hub.php
│   ├── assets/css/           design-system.css · animations.css
│   ├── assets/js/main.js     defensive GSAP + Lenis animations
│   └── includes/             4 custom Elementor widgets (PHP)
├── theme/                    Hello Elementor child theme
├── scripts/
│   └── setup.sh              WP-CLI one-command setup
├── elementor-templates/
│   ├── page.json             Pre-built page layout (all 6 sections)
│   └── header.json           Pre-built header template (ph-nav)
├── preview/
│   └── index.html            Standalone design preview — open in any browser
└── INSTALL.md                Full handoff & deployment guide
```

---

## Quick start

```bash
# 1. Upload plugin/ to wp-content/plugins/penny-hardaway-hub/
# 2. Upload theme/  to wp-content/themes/penny-hardaway-child/
# 3. SSH into WP Engine Dev environment and run:
bash scripts/setup.sh
```

The script activates everything, creates the page, imports the Elementor layouts, and sets the front page. See `INSTALL.md` for the full guide.

---

## Widgets

| Widget | Elementor name | Editable controls |
|---|---|---|
| Cinematic Hero | `PH: Cinematic Hero` | Video MP4/WebM, fallback image, headline, CTA |
| Featured Video | `PH: Featured Video` | YouTube ID, thumbnail, title, description |
| Ventures Directory | `PH: Ventures Directory` | Repeater: name, desc, image, URL |
| Inquiry Form | `PH: Inquiry Form` | Title, description, pilot notice, submit label |

---

## Stack

| | |
|---|---|
| CMS | WordPress on WP Engine |
| Builder | Elementor Pro |
| Theme | Hello Elementor + `penny-hardaway-child` |
| Animations | GSAP 3.12.5 + ScrollTrigger (CDN) |
| Smooth scroll | Lenis 1.0.42 (CDN) |
| Fonts | Cormorant Garamond + DM Sans (Google Fonts CDN) |

## Design tokens

`#0a0a0a` black · `#1a1a1a` charcoal · `#0d1b2a` navy · `#f0ead6` cream · `#b89a5a` gold
