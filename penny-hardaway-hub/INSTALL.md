# Penny Hardaway Brand Hub — Installation & Handoff Guide

## Repository Structure

```
penny-hardaway-hub/
├── plugin/                  → Upload & activate as WordPress plugin
├── theme/                   → Upload & activate as child theme
├── scripts/
│   └── setup.sh             → WP-CLI automation (run after upload)
├── elementor-templates/
│   ├── page.json            → Pre-built Elementor page layout
│   └── header.json          → Pre-built Elementor header template
├── preview/
│   └── index.html           → Standalone design preview
└── INSTALL.md               → This file
```

---

## Automated Setup (Recommended)

After uploading the plugin and theme, SSH into the WP Engine Dev environment and run:

```bash
bash scripts/setup.sh
```

This single command:
- Activates the child theme and plugin
- Creates the home page with Elementor Full Width template
- Imports the pre-built page layout (all 6 sections, correct widget defaults)
- Creates the header template with `ph-nav` ID and display condition set to entire site
- Sets WordPress to show the new page as the static front page
- Flushes rewrite rules, object cache, and Elementor CSS cache

After the script finishes, skip to **Step 4 — Animation CSS Classes**.

---

## Manual Setup (Alternative)

Use this only if WP-CLI / SSH is unavailable.

### Step 1 — Install the Child Theme

1. Zip the `theme/` folder and rename it `penny-hardaway-child.zip`
2. WP Admin → **Appearance → Themes → Add New → Upload Theme**
3. Upload and activate **Penny Hardaway Child**
   - Parent theme **Hello Elementor** must already be installed

### Step 2 — Install the Plugin

1. Zip the `plugin/` folder and rename it `penny-hardaway-hub.zip`
2. WP Admin → **Plugins → Add New → Upload Plugin**
3. Upload and activate **Penny Hardaway Brand Hub**

### Step 3 — Build the Page in Elementor

#### 3a. Create the Header (Elementor Pro Theme Builder)

1. Elementor → **Theme Builder → Header → Add New**
2. Build navigation with the following anchor links:

| Label | Target |
|---|---|
| Home | `#home` |
| Featured Media | `#featured-media` |
| Current Work | `#current-work` |
| Ventures | `#ventures` |
| Memphis Basketball | `#memphis-basketball` |
| Contact | `#contact` |
| Basketball Camp ↗ | `https://pennyhardawaybasketballcamp.com` |

3. Set the Section **CSS ID** to `ph-nav` (Advanced tab → CSS ID field) — enables the sticky blur on scroll
4. Set display conditions → **Entire Site**

#### 3b. Build the One-Page Layout

Create a new page and add these widgets from the **Penny Hardaway Hub** category:

| Order | Section ID | Widget |
|---|---|---|
| 1 | `#home` | PH: Cinematic Hero |
| 2 | `#featured-media` | PH: Featured Video |
| 3 | `#current-work` | Standard Elementor sections |
| 4 | `#ventures` | PH: Ventures Directory |
| 5 | `#memphis-basketball` | Standard Elementor sections |
| 6 | `#contact` | PH: Inquiry Form |

> Set the page template to **Elementor Full Width** (hides theme header/footer)

---

## Step 4 — Animation CSS Classes

Apply in Elementor's **Advanced → CSS Classes** field:

| Class | Effect |
|---|---|
| `ph-reveal` | Fade up on scroll (single element) |
| `ph-reveal-group` | Children stagger in on scroll |
| `ph-line-reveal` | Wrap a `<span>` inside for text wipe |
| `ph-parallax-wrap` + `ph-parallax-img` | Parallax image pair |
| `ph-magnetic` | Magnetic hover pull (buttons / cards) |

---

## Step 5 — Video Assets

### Hero Video
- Format: **MP4** + **WebM** (provide both for best coverage)
- Target size: **under 8MB** for mobile load
- Recommended encode: H.264, 1920×1080, 30fps, 2–4Mbps
- Upload via **Media Library**, paste URL into widget controls
- Mobile fallback image replaces video on screens ≤8px

### Featured Video
- Upload a custom thumbnail to Media Library (optional)
- Paste only the **YouTube Video ID** into the widget (e.g. `dQw4w9WgXcQ`)
- If no thumbnail is provided, plugin auto-fetches the YouTube maxres thumbnail
- YouTube IDs are **case-sensitive** — copy exactly from the URL

---

## Pre-Launch Checklist

These are silent failures — no error message if skipped:

- [ ] Hero video uploaded and URL set in widget controls (or fallback image set for mobile)
- [ ] YouTube Video ID entered in Featured Video widget
- [ ] All venture cards have real images, names, descriptions, and working URLs
- [ ] Memphis Basketball section populated with current-season content
- [ ] Elementor Pro license active on this environment
- [ ] Header template display condition set to **Entire Site**
- [ ] Page template set to **Elementor Full Width**
- [ ] WordPress front page set to the new page (Settings → Reading → Static Page)
- [ ] WP Admin → Elementor → Tools → **Regenerate CSS** run after all changes
- [ ] Tested on mobile: video hidden, fallback image visible
- [ ] Smooth scroll and animations verified in a real browser (not Elementor editor)
- [ ] Pushed to Staging for client review before Production deploy

---

## Team Editing Reference

| Safe to edit in Elementor | Do NOT modify |
|---|---|
| All text content | Custom CSS / JS fields |
| Images & video URLs | Plugin PHP files |
| YouTube Video IDs | Theme `functions.php` |
| Venture card data | Animation class structure |
| Button labels & links | Container/section nesting |
| Contact copy | CDN script URLs |

---

## WP Engine Deployment

```
Development  → build & test
Staging      → client review
Production   → approved push only
```

Deploy via WP Engine's **Push to** workflow or SFTP.
Ensure the `penny-hardaway-hub` plugin and `penny-hardaway-child` theme are present in all environments before activating Elementor.
