<?php
namespace Penny_Hub;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit;

class Widget_Cinematic_Hero extends Widget_Base {

    public function get_name()        { return 'ph_cinematic_hero'; }
    public function get_title()       { return 'PH: Cinematic Hero'; }
    public function get_icon()        { return 'eicon-video-camera'; }
    public function get_categories()  { return [ 'penny-hub' ]; }

    protected function register_controls() {

        $this->start_controls_section( 'section_content', [
            'label' => 'Hero Content',
            'tab'   => Controls_Manager::TAB_CONTENT,
        ] );

        $this->add_control( 'video_mp4', [
            'label'       => 'Video — MP4',
            'type'        => Controls_Manager::MEDIA,
            'media_types' => [ 'video' ],
            'description' => 'Compressed MP4, target < 8MB',
        ] );
        $this->add_control( 'video_webm', [
            'label'       => 'Video — WebM',
            'type'        => Controls_Manager::MEDIA,
            'media_types' => [ 'video' ],
            'description' => 'Smaller file size for modern browsers',
        ] );
        $this->add_control( 'fallback_image', [
            'label'       => 'Mobile Fallback Image',
            'type'        => Controls_Manager::MEDIA,
            'description' => 'Shown on mobile where video is hidden',
        ] );
        $this->add_control( 'label_text', [
            'label'   => 'Label (above headline)',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Memphis, Tennessee',
        ] );
        $this->add_control( 'headline', [
            'label'   => 'Headline',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Penny Hardaway',
        ] );
        $this->add_control( 'subline', [
            'label'   => 'Subline',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Leadership. Culture. Memphis.',
        ] );
        $this->add_control( 'cta_text', [
            'label'   => 'CTA Button Text',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Explore the Hub',
        ] );
        $this->add_control( 'cta_link', [
            'label'   => 'CTA Link',
            'type'    => Controls_Manager::URL,
            'default' => [ 'url' => '#current-work' ],
        ] );

        $this->end_controls_section();
    }

    protected function render() {
        $s       = $this->get_settings_for_display();
        $mp4     = $s['video_mp4']['url']      ?? '';
        $webm    = $s['video_webm']['url']     ?? '';
        $fb_img  = $s['fallback_image']['url'] ?? '';
        $cta_url = esc_url( $s['cta_link']['url'] ?? '#' );
        $target  = ! empty( $s['cta_link']['is_external'] ) ? '_blank' : '_self';
        ?>
        <section id="home" class="ph-hero" aria-label="Hero">

            <div class="ph-hero__video-wrap" aria-hidden="true">
                <?php if ( $mp4 || $webm ) : ?>
                <video autoplay muted loop playsinline preload="none">
                    <?php if ( $webm ) : ?><source src="<?php echo esc_url( $webm ); ?>" type="video/webm"><?php endif; ?>
                    <?php if ( $mp4  ) : ?><source src="<?php echo esc_url( $mp4 );  ?>" type="video/mp4"><?php endif; ?>
                </video>
                <?php endif; ?>
                <?php if ( $fb_img ) : ?>
                <div class="ph-hero__fallback" style="background-image:url('<?php echo esc_url( $fb_img ); ?>')"></div>
                <?php endif; ?>
            </div>

            <div class="ph-hero__overlay" aria-hidden="true"></div>

            <div class="ph-hero__content">
                <?php if ( $s['label_text'] ) : ?>
                <span class="ph-hero__label ph-reveal"><?php echo esc_html( $s['label_text'] ); ?></span>
                <?php endif; ?>

                <h1 class="ph-hero__headline">
                    <span class="ph-line-reveal"><span><?php echo esc_html( $s['headline'] ); ?></span></span>
                </h1>

                <?php if ( $s['subline'] ) : ?>
                <p class="ph-hero__sub ph-reveal"><?php echo esc_html( $s['subline'] ); ?></p>
                <?php endif; ?>

                <?php if ( $s['cta_text'] ) : ?>
                <a href="<?php echo $cta_url; ?>" target="<?php echo esc_attr( $target ); ?>" class="ph-btn ph-btn-outline ph-magnetic">
                    <?php echo esc_html( $s['cta_text'] ); ?>
                </a>
                <?php endif; ?>
            </div>

            <div class="ph-hero__scroll" aria-hidden="true">
                <div class="ph-hero__scroll-line"></div>
                <span>Scroll</span>
            </div>

        </section>
        <?php
    }
}
