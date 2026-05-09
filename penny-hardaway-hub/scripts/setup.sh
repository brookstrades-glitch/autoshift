#!/usr/bin/env bash
# =============================================================================
# Penny Hardaway Brand Hub — WP-CLI Setup Script
# Run over SSH on WP Engine Dev after uploading theme & plugin.
#
# Usage:
#   bash scripts/setup.sh
#
# Optional env var:
#   WP_PATH=/path/to/wordpress   (if WP is not in the current directory)
# =============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[setup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[warn]${NC}  $*"; }
abort() { echo -e "${RED}[error]${NC} $*" >&2; exit 1; }

command -v wp >/dev/null 2>&1 || abort "WP-CLI not found."

WP_FLAGS=()
[[ -n "${WP_PATH:-}" ]] && WP_FLAGS+=("--path=${WP_PATH}")

wp core is-installed "${WP_FLAGS[@]}" 2>/dev/null \
  || abort "WordPress not found. Set WP_PATH env var if needed."

info "WordPress detected. Starting setup..."
echo ""

# ---------------------------------------------------------------------------
# 1. Themes
# ---------------------------------------------------------------------------
info "Activating Hello Elementor parent theme..."
if wp theme is-installed hello-elementor "${WP_FLAGS[@]}" 2>/dev/null; then
  wp theme activate hello-elementor "${WP_FLAGS[@]}" --quiet \
    || warn "Could not activate Hello Elementor."
else
  warn "Hello Elementor not installed — install it from WP Admin > Themes, then re-run."
fi

info "Activating Penny Hardaway child theme..."
wp theme activate penny-hardaway-child "${WP_FLAGS[@]}" \
  || abort "Child theme activation failed. Ensure folder is uploaded as 'penny-hardaway-child'."

# ---------------------------------------------------------------------------
# 2. Plugin
# ---------------------------------------------------------------------------
info "Activating Penny Hardaway Hub plugin..."
wp plugin activate penny-hardaway-hub "${WP_FLAGS[@]}" \
  || abort "Plugin activation failed. Ensure folder is uploaded as 'penny-hardaway-hub'."

# ---------------------------------------------------------------------------
# 3. Elementor Pro check
# ---------------------------------------------------------------------------
if wp plugin is-active elementor-pro "${WP_FLAGS[@]}" 2>/dev/null; then
  info "Elementor Pro is active."
else
  warn "Elementor Pro not active. Activate it in WP Admin before templates render correctly."
fi

# ---------------------------------------------------------------------------
# 4. Home page
# ---------------------------------------------------------------------------
info "Setting up home page..."
PAGE_ID=$(wp post list "${WP_FLAGS[@]}" \
  --post_type=page --post_status=any \
  --name="penny-hardaway-hub-home" \
  --fields=ID --format=ids 2>/dev/null || true)

if [[ -n "$PAGE_ID" ]]; then
  info "Found existing home page (ID: $PAGE_ID)."
else
  PAGE_ID=$(wp post create "${WP_FLAGS[@]}" \
    --post_type=page \
    --post_status=publish \
    --post_title="Penny Hardaway" \
    --post_name="penny-hardaway-hub-home" \
    --post_content="" \
    --porcelain)
  info "Created home page (ID: $PAGE_ID)."
fi

wp post meta update "${WP_FLAGS[@]}" "$PAGE_ID" _wp_page_template "elementor_header_footer" \
  && info "Set page template to Elementor Full Width."

# ---------------------------------------------------------------------------
# 5. Import Elementor page layout
# ---------------------------------------------------------------------------
PAGE_JSON="${REPO_ROOT}/elementor-templates/page.json"
if [[ -f "$PAGE_JSON" ]]; then
  info "Importing Elementor page layout..."
  wp post meta update "${WP_FLAGS[@]}" "$PAGE_ID" _elementor_data "$(cat "$PAGE_JSON")"
  wp post meta update "${WP_FLAGS[@]}" "$PAGE_ID" _elementor_edit_mode "builder"
  info "Page layout imported."
else
  warn "elementor-templates/page.json not found — skipping page layout import."
fi

# ---------------------------------------------------------------------------
# 6. Header template
# ---------------------------------------------------------------------------
HEADER_JSON="${REPO_ROOT}/elementor-templates/header.json"
if [[ -f "$HEADER_JSON" ]]; then
  info "Setting up Elementor header template..."

  HEADER_ID=$(wp post list "${WP_FLAGS[@]}" \
    --post_type=elementor_library \
    --post_status=any \
    --name="ph-header-template" \
    --fields=ID --format=ids 2>/dev/null || true)

  if [[ -n "$HEADER_ID" ]]; then
    info "Found existing header template (ID: $HEADER_ID). Updating..."
  else
    HEADER_ID=$(wp post create "${WP_FLAGS[@]}" \
      --post_type=elementor_library \
      --post_status=publish \
      --post_title="PH Header" \
      --post_name="ph-header-template" \
      --porcelain)
    info "Created header template (ID: $HEADER_ID)."
  fi

  wp post meta update "${WP_FLAGS[@]}" "$HEADER_ID" _elementor_data "$(cat "$HEADER_JSON")"
  wp post meta update "${WP_FLAGS[@]}" "$HEADER_ID" _elementor_edit_mode "builder"
  wp post meta update "${WP_FLAGS[@]}" "$HEADER_ID" _elementor_template_type "header"
  # PHP serialized array('include/general') = display on entire site
  wp post meta update "${WP_FLAGS[@]}" "$HEADER_ID" _elementor_conditions \
    'a:1:{i:0;s:15:"include/general";}'
  info "Header imported and set to display on entire site."
else
  warn "elementor-templates/header.json not found — skipping header import."
fi

# ---------------------------------------------------------------------------
# 7. Static front page
# ---------------------------------------------------------------------------
info "Setting static front page..."
wp option update "${WP_FLAGS[@]}" show_on_front "page"
wp option update "${WP_FLAGS[@]}" page_on_front "$PAGE_ID"
info "Front page set to page ID $PAGE_ID."

# ---------------------------------------------------------------------------
# 8. Flush caches
# ---------------------------------------------------------------------------
info "Flushing rewrite rules and object cache..."
wp rewrite flush "${WP_FLAGS[@]}"
wp cache flush "${WP_FLAGS[@]}" 2>/dev/null || true

if wp cli has-command "elementor flush-css" 2>/dev/null; then
  wp elementor flush-css "${WP_FLAGS[@]}" && info "Elementor CSS cache flushed."
fi

if wp cli has-command "page-cache flush" 2>/dev/null; then
  wp page-cache flush "${WP_FLAGS[@]}" && info "WP Engine page cache flushed."
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
echo ""
echo -e "${GREEN}============================================================${NC}"
echo -e "${GREEN} Setup complete!${NC}"
echo -e "${GREEN}============================================================${NC}"
echo ""
echo "  Home page ID  :  $PAGE_ID"
[[ -n "${HEADER_ID:-}" ]] && echo "  Header ID     :  $HEADER_ID"
echo ""
echo "  Remaining manual steps:"
echo "  1. WP Admin > Elementor > Tools > Regenerate CSS"
echo "  2. Open home page in Elementor editor — verify all 6 sections loaded"
echo "  3. Upload hero video (MP4 + WebM) via Media Library, set in Hero widget"
echo "  4. Paste YouTube Video ID into Featured Video widget"
echo "  5. Add venture card images, names, descriptions, and links"
echo "  6. Confirm Elementor Pro license is active"
echo ""
