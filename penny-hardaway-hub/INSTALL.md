# Penny Hardaway Brand Hub — Installation & Handoff Guide

## Repository Structure

```
penny-hardaway-hub/
├── plugin/     → Upload & activate as a WordPress plugin
├── theme/      → Upload & activate as child theme
└── INSTALL.md  → This file
```

---

## Step 1 — Install the Child Theme

1. Zip the `theme/` folder and rename the zip `penny-hardaway-child.zip`
2. WordPress Admin → **Appearance → Themes → Add New → Upload Theme**
3. Upload and activate **Penny Hardaway Child**
   - Parent theme **Hello Elementor** must already be installed

---

## Step 2 — Install the Plugin

1. Zip the `plugin/` folder and rename the zip `penny-hardaway-hub.zip`
2. WordPress Admin → **Plugins → Add New → Upload Plugin**
3. Upload and activate **Penny Hardaway Brand Hub**

---

## Step 3 — Build the Page in Elementor

### 3a. Create the Header (Elementor Pro Theme Builder)

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

3. Set the Section HTML ID to `ph-nav` — this enables the sticky blur effect on scroll
4. Set display conditions → **Entire Site**

### 3b. Build the One-Page Layout

Create a new page and add these widgets from the **Penny Hardaway Hub** widget category:

| Order | Section ID | Widget |
|---|---|---|
| 1 | `#home` | PH: Cinematic Hero |
| 2 | `#featured-media` | PH: Featured Video |
| 3 | `#current-work` | Standard Elementor sections |
| 4 | `#ventures` | PH: Ventures Directory |
| 5 | `#contact` | PH: Inquiry Form |

> Set the page template to **Elementor Full Width** (no header/footer from theme)

---

## Step 4 — Animation CSS Classes

Apply these in Elementor's **Advanced → CSS Classes** field:

| Class | Effect |
|---|---|
| `ph-reveal` | Fade up on scroll (single element) |
| `ph-reveal-group` | Children stagger in on scroll |
| `ph-line-reveal` | Wrap a `<span>` inside for text wipe |
| `ph-parallax-wrap` + `ph-parallax-img` | Parallax image pair |
| `ph-magnetic` | Magnetic hover pull (buttons/cards) |

---

## Step 5 — Video Assets

### Hero Video
- Format: **MP4** + **WebM** (provide both for best coverage)
- Target size: **under 8MB** for reasonable mobile load
- Recommended encode: H.264, 1920×1080, 30fps, 2–4Mbps
- Upload via **Media Library**, paste URL into widget controls
- The mobile fallback image replaces the video on screens ≤768px

### Featured Video
- Upload a custom thumbnail image to Media Library
- Paste only the **YouTube Video ID** into the widget (e.g. `dQw4w9WgXcQ`)
- If no thumbnail is provided, the plugin auto-fetches the YouTube maxres thumbnail

---

## Step 6 — Contact Form Email Routing

By default, inquiries are sent to **Settings → General → Administration Email**.

To route to a different address, edit `plugin/penny-hardaway-hub.php` line:
```php
$to = get_option( 'admin_email' );
```
Replace with a hardcoded address or use a custom option.

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
