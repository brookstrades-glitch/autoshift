<?php
if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * Enqueue parent Hello Elementor stylesheet
 */
add_action( 'wp_enqueue_scripts', function() {
    wp_enqueue_style(
        'hello-elementor-child',
        get_stylesheet_directory_uri() . '/style.css',
        [ 'hello-elementor' ],
        wp_get_theme()->get( 'Version' )
    );
} );

// Suppress the default page title rendered by Hello Elementor
add_filter( 'hello_elementor_page_title', '__return_false' );

// Clean up wp_head noise
remove_action( 'wp_head', 'wp_generator' );
remove_action( 'wp_head', 'wlwmanifest_link' );
remove_action( 'wp_head', 'rsd_link' );
remove_action( 'wp_head', 'wp_shortlink_wp_head' );
