<?php
/**
 * Plugin Name: Penny Hardaway Brand Hub
 * Description: Custom Elementor widgets, animations, and design system for the Penny Hardaway Brand Hub.
 * Version:     1.0.0
 * Author:      Your Agency
 * Text Domain: penny-hub
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'PENNY_HUB_VERSION', '1.0.0' );
define( 'PENNY_HUB_PATH',    plugin_dir_path( __FILE__ ) );
define( 'PENNY_HUB_URL',     plugin_dir_url( __FILE__ ) );

// Register custom Elementor widget category
add_action( 'elementor/elements/categories_registered', function( $elements_manager ) {
    $elements_manager->add_category( 'penny-hub', [
        'title' => 'Penny Hardaway Hub',
        'icon'  => 'fa fa-star',
    ] );
} );

// Register widgets
add_action( 'elementor/widgets/register', function( $widgets_manager ) {
    require_once PENNY_HUB_PATH . 'includes/class-widget-cinematic-hero.php';
    require_once PENNY_HUB_PATH . 'includes/class-widget-featured-video.php';
    require_once PENNY_HUB_PATH . 'includes/class-widget-venture-card.php';
    require_once PENNY_HUB_PATH . 'includes/class-widget-inquiry-form.php';

    $widgets_manager->register( new \Penny_Hub\Widget_Cinematic_Hero() );
    $widgets_manager->register( new \Penny_Hub\Widget_Featured_Video() );
    $widgets_manager->register( new \Penny_Hub\Widget_Venture_Card() );
    $widgets_manager->register( new \Penny_Hub\Widget_Inquiry_Form() );
} );

// Enqueue frontend assets
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

    // GSAP + ScrollTrigger from CDN
    wp_enqueue_script(
        'gsap',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
        [],
        '3.12.5',
        true
    );
    wp_enqueue_script(
        'gsap-scrolltrigger',
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js',
        [ 'gsap' ],
        '3.12.5',
        true
    );
    wp_enqueue_script(
        'lenis',
        'https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/bundled/lenis.min.js',
        [],
        '1.0.42',
        true
    );
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

// AJAX handler — inquiry form
add_action( 'wp_ajax_penny_hub_inquiry',        'penny_hub_handle_inquiry' );
add_action( 'wp_ajax_nopriv_penny_hub_inquiry', 'penny_hub_handle_inquiry' );

function penny_hub_handle_inquiry() {
    check_ajax_referer( 'penny_hub_inquiry', 'nonce' );

    $name    = sanitize_text_field( $_POST['name']         ?? '' );
    $email   = sanitize_email(      $_POST['email']        ?? '' );
    $org     = sanitize_text_field( $_POST['organization'] ?? '' );
    $reason  = sanitize_text_field( $_POST['reason']       ?? '' );
    $message = sanitize_textarea_field( $_POST['message']  ?? '' );

    if ( ! $name || ! is_email( $email ) || ! $message ) {
        wp_send_json_error( [ 'message' => 'Please fill in all required fields.' ] );
    }

    $to      = get_option( 'admin_email' );
    $subject = "[Brand Hub Inquiry] {$reason} – {$name}";
    $body    = "Name: {$name}\nEmail: {$email}\nOrganization: {$org}\nReason: {$reason}\n\nMessage:\n{$message}";
    $headers = [
        'Content-Type: text/plain; charset=UTF-8',
        "Reply-To: {$email}",
    ];

    if ( wp_mail( $to, $subject, $body, $headers ) ) {
        wp_send_json_success( [ 'message' => 'Your inquiry has been submitted. We\'ll be in touch.' ] );
    } else {
        wp_send_json_error( [ 'message' => 'There was a problem sending your message. Please try again.' ] );
    }
}
