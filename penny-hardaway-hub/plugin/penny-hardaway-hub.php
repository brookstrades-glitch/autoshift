<?php
/**
 * Plugin Name: Penny Hardaway Brand Hub
 * Description: Custom Elementor widgets, animations, and design system for the Penny Hardaway Brand Hub.
 * Version:     1.1.0
 * Author:      Your Agency
 * Text Domain: penny-hub
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'PENNY_HUB_VERSION', '1.1.0' );
define( 'PENNY_HUB_PATH',    plugin_dir_path( __FILE__ ) );
define( 'PENNY_HUB_URL',     plugin_dir_url( __FILE__ ) );

// -------------------------------------------------------------------------
// Admin notice: warn if no SMTP plugin is active
// -------------------------------------------------------------------------
add_action( 'admin_notices', function() {
    if ( ! current_user_can( 'manage_options' ) ) return;

    $known_smtp = [
        'wp-mail-smtp/wp_mail_smtp.php',
        'post-smtp/postman-smtp.php',
        'easy-wp-smtp/easy-wp-smtp.php',
        'sendgrid-email-delivery-simplified/wpsendgrid.php',
    ];
    $active = (array) get_option( 'active_plugins', [] );

    if ( empty( array_intersect( $known_smtp, $active ) ) ) {
        echo '<div class="notice notice-warning is-dismissible">
            <p><strong>Penny Hardaway Hub:</strong> No SMTP plugin detected.
            Inquiry form emails may not deliver reliably on WP Engine.
            Install <a href="https://wordpress.org/plugins/wp-mail-smtp/" target="_blank">WP Mail SMTP</a> (free) before launch.</p>
        </div>';
    }
} );

// -------------------------------------------------------------------------
// Elementor widget category
// -------------------------------------------------------------------------
add_action( 'elementor/elements/categories_registered', function( $mgr ) {
    $mgr->add_category( 'penny-hub', [
        'title' => 'Penny Hardaway Hub',
        'icon'  => 'fa fa-star',
    ] );
} );

// -------------------------------------------------------------------------
// Register widgets
// -------------------------------------------------------------------------
add_action( 'elementor/widgets/register', function( $mgr ) {
    require_once PENNY_HUB_PATH . 'includes/class-widget-cinematic-hero.php';
    require_once PENNY_HUB_PATH . 'includes/class-widget-featured-video.php';
    require_once PENNY_HUB_PATH . 'includes/class-widget-venture-card.php';
    require_once PENNY_HUB_PATH . 'includes/class-widget-inquiry-form.php';

    $mgr->register( new \Penny_Hub\Widget_Cinematic_Hero() );
    $mgr->register( new \Penny_Hub\Widget_Featured_Video() );
    $mgr->register( new \Penny_Hub\Widget_Venture_Card() );
    $mgr->register( new \Penny_Hub\Widget_Inquiry_Form() );
} );

// -------------------------------------------------------------------------
// Enqueue frontend assets
// -------------------------------------------------------------------------
add_action( 'wp_enqueue_scripts', function() {

    wp_enqueue_style(
        'penny-hub-design-system',
        PENNY_HUB_URL . 'assets/css/design-system.css',
        [],
        PENNY_HUB_VERSION
    );
    wp_enqueue_style(
        'penny-hub-animations',
        PENNY_HUB_URL . 'assets/css/animations.css',
        [ 'penny-hub-design-system' ],
        PENNY_HUB_VERSION
    );

    // GSAP — load from CDN, no-op fallback if it fails (main.js guards against this)
    wp_enqueue_script( 'gsap',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        [], '3.12.5', true );
    wp_enqueue_script( 'gsap-scrolltrigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        [ 'gsap' ], '3.12.5', true );
    wp_enqueue_script( 'lenis',
        'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js',
        [], '1.0.42', true );

    wp_enqueue_script(
        'penny-hub-main',
        PENNY_HUB_URL . 'assets/js/main.js',
        [ 'gsap', 'gsap-scrolltrigger', 'lenis' ],
        PENNY_HUB_VERSION,
        true
    );

    wp_localize_script( 'penny-hub-main', 'pennyHub', [
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'nonce'   => wp_create_nonce( 'penny_hub_inquiry' ),
    ] );
} );

// -------------------------------------------------------------------------
// Rate limiting helper — max 3 submissions per IP per hour
// -------------------------------------------------------------------------
function penny_hub_is_rate_limited(): bool {
    $ip  = sanitize_text_field( $_SERVER['REMOTE_ADDR'] ?? 'unknown' );
    $key = 'penny_hub_rl_' . md5( $ip );
    $count = (int) get_transient( $key );

    if ( $count >= 3 ) return true;

    set_transient( $key, $count + 1, HOUR_IN_SECONDS );
    return false;
}

// -------------------------------------------------------------------------
// Submission log — stores last 100 inquiries in wp_options as a safety net
// so no inquiry is ever silently lost even if wp_mail fails
// -------------------------------------------------------------------------
function penny_hub_log_submission( array $entry ): void {
    $log   = (array) get_option( 'penny_hub_inquiry_log', [] );
    $log[] = array_merge( $entry, [ 'time' => current_time( 'mysql' ) ] );
    if ( count( $log ) > 100 ) {
        $log = array_slice( $log, -100 );
    }
    update_option( 'penny_hub_inquiry_log', $log, false );
}

// -------------------------------------------------------------------------
// AJAX — inquiry form handler
// -------------------------------------------------------------------------
add_action( 'wp_ajax_penny_hub_inquiry',        'penny_hub_handle_inquiry' );
add_action( 'wp_ajax_nopriv_penny_hub_inquiry', 'penny_hub_handle_inquiry' );

function penny_hub_handle_inquiry(): void {
    check_ajax_referer( 'penny_hub_inquiry', 'nonce' );

    if ( penny_hub_is_rate_limited() ) {
        wp_send_json_error( [ 'message' => 'Too many submissions. Please try again in an hour.' ] );
    }

    $name    = sanitize_text_field(     $_POST['name']         ?? '' );
    $email   = sanitize_email(          $_POST['email']        ?? '' );
    $org     = sanitize_text_field(     $_POST['organization'] ?? '' );
    $reason  = sanitize_text_field(     $_POST['reason']       ?? '' );
    $message = sanitize_textarea_field( $_POST['message']      ?? '' );

    if ( ! $name || ! is_email( $email ) || ! $message ) {
        wp_send_json_error( [ 'message' => 'Please fill in all required fields.' ] );
    }

    // Log the submission first — this is our safety net regardless of mail outcome
    penny_hub_log_submission( compact( 'name', 'email', 'org', 'reason', 'message' ) );

    $to      = get_option( 'admin_email' );
    $subject = "[Brand Hub Inquiry] {$reason} – {$name}";
    $body    = "Name: {$name}\nEmail: {$email}\nOrganization: {$org}\nReason: {$reason}\n\nMessage:\n{$message}";
    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        "Reply-To: {$email}",
    ];

    wp_mail( $to, $subject, $body, $headers );

    // Always return success — submission is logged even if mail fails.
    // Check wp-admin > Settings or the penny_hub_inquiry_log option for all submissions.
    wp_send_json_success( [ 'message' => "Thank you, {$name}. Your inquiry has been received. We\'ll be in touch." ] );
}
