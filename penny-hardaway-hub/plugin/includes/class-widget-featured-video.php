<?php
namespace Penny_Hub;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit;

class Widget_Featured_Video extends Widget_Base {

    public function get_name()       { return 'ph_featured_video'; }
    public function get_title()      { return 'PH: Featured Video'; }
    public function get_icon()       { return 'eicon-youtube'; }
    public function get_categories() { return [ 'penny-hub' ]; }

    protected function register_controls() {

        $this->start_controls_section( 'section_content', [
            'label' => 'Video Content',
            'tab'   => Controls_Manager::TAB_CONTENT,
        ] );

        $this->add_control( 'section_label', [
            'label'   => 'Section Label',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Featured',
        ] );
        $this->add_control( 'title', [
            'label'   => 'Title',
            'type'    => Controls_Manager::TEXTAREA,
            'default' => 'Watch the Story',
        ] );
        $this->add_control( 'description', [
            'label' => 'Description',
            'type'  => Controls_Manager::TEXTAREA,
        ] );
        $this->add_control( 'thumbnail', [
            'label'       => 'Custom Thumbnail',
            'type'        => Controls_Manager::MEDIA,
            'description' => 'Leave blank to auto-fetch YouTube thumbnail',
        ] );
        $this->add_control( 'youtube_id', [
            'label'       => 'YouTube Video ID',
            'type'        => Controls_Manager::TEXT,
            'placeholder' => 'dQw4w9WgXcQ',
            'description' => 'The ID after ?v= in the YouTube URL',
        ] );

        $this->end_controls_section();
    }

    protected function render() {
        $s         = $this->get_settings_for_display();
        $thumb_url = $s['thumbnail']['url'] ?? '';
        $yt_id     = sanitize_key( $s['youtube_id'] ?? '' );

        // Fall back to YouTube-generated maxres thumbnail
        if ( ! $thumb_url && $yt_id ) {
            $thumb_url = 'https://img.youtube.com/vi/' . $yt_id . '/maxresdefault.jpg';
        }
        ?>
        <section id="featured-media" class="ph-section">
            <div class="ph-container">
                <div class="ph-featured-video-inner" style="display:grid;grid-template-columns:1fr 1fr;gap:5rem;align-items:center;">

                    <div>
                        <?php if ( $s['section_label'] ) : ?>
                        <span class="ph-section-label ph-reveal"><?php echo esc_html( $s['section_label'] ); ?></span>
                        <?php endif; ?>
                        <?php if ( $s['title'] ) : ?>
                        <h2 class="ph-headline ph-reveal"><?php echo esc_html( $s['title'] ); ?></h2>
                        <?php endif; ?>
                        <hr class="ph-rule ph-reveal" aria-hidden="true">
                        <?php if ( $s['description'] ) : ?>
                        <p class="ph-body ph-reveal" style="margin-top:1rem;"><?php echo esc_html( $s['description'] ); ?></p>
                        <?php endif; ?>
                    </div>

                    <div class="ph-reveal">
                        <?php if ( $thumb_url && $yt_id ) : ?>
                        <div class="ph-video-thumb ph-magnetic"
                             data-video-id="<?php echo esc_attr( $yt_id ); ?>"
                             role="button" tabindex="0"
                             aria-label="Play featured video">
                            <img src="<?php echo esc_url( $thumb_url ); ?>" alt="Video thumbnail" loading="lazy">
                            <div class="ph-play-btn" aria-hidden="true">
                                <div class="ph-play-btn__circle">
                                    <div class="ph-play-btn__icon"></div>
                                </div>
                            </div>
                        </div>
                        <?php endif; ?>
                    </div>

                </div>
            </div>
        </section>

        <!-- Global video modal — rendered once, reused by all video triggers -->
        <div id="ph-video-modal" class="ph-modal" role="dialog" aria-modal="true" aria-label="Video player">
            <div class="ph-modal__inner">
                <button id="ph-modal-close" class="ph-modal__close">&#x2715;&nbsp; Close</button>
                <div class="ph-modal__iframe-wrap" id="ph-modal-iframe-wrap"></div>
            </div>
        </div>
        <?php
    }
}
