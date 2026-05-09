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
} );
