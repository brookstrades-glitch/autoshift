<?php
namespace Penny_Hub;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Repeater;

if ( ! defined( 'ABSPATH' ) ) exit;

class Widget_Venture_Card extends Widget_Base {

    public function get_name()       { return 'ph_venture_card'; }
    public function get_title()      { return 'PH: Ventures Directory'; }
    public function get_icon()       { return 'eicon-posts-grid'; }
    public function get_categories() { return [ 'penny-hub' ]; }

    protected function register_controls() {

        $this->start_controls_section( 'section_content', [
            'label' => 'Ventures',
            'tab'   => Controls_Manager::TAB_CONTENT,
        ] );

        $this->add_control( 'section_label', [
            'label'   => 'Section Label',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Ventures',
        ] );
        $this->add_control( 'title', [
            'label'   => 'Section Title',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Beyond the Court',
        ] );
        $this->add_control( 'description', [
            'label' => 'Section Description',
            'type'  => Controls_Manager::TEXTAREA,
        ] );

        $repeater = new Repeater();

        $repeater->add_control( 'name', [
            'label'   => 'Venture Name',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Venture',
        ] );
        $repeater->add_control( 'desc', [
            'label' => 'Description',
            'type'  => Controls_Manager::TEXTAREA,
        ] );
        $repeater->add_control( 'image', [
            'label' => 'Image',
            'type'  => Controls_Manager::MEDIA,
        ] );
        $repeater->add_control( 'btn_text', [
            'label'   => 'Button Text',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Visit Site',
        ] );
        $repeater->add_control( 'url', [
            'label'   => 'External URL',
            'type'    => Controls_Manager::URL,
            'default' => [ 'url' => '', 'is_external' => true ],
        ] );

        $this->add_control( 'ventures', [
            'label'       => 'Venture Cards',
            'type'        => Controls_Manager::REPEATER,
            'fields'      => $repeater->get_controls(),
            'default'     => [
                [
                    'name'     => 'Penny Hardaway Basketball Camp',
                    'desc'     => 'Developing the next generation through elite coaching, discipline, and culture.',
                    'btn_text' => 'Visit Site',
                    'url'      => [ 'url' => 'https://pennyhardawaybasketballcamp.com', 'is_external' => true ],
                ],
            ],
            'title_field' => '{{{ name }}}',
        ] );

        $this->end_controls_section();
    }

    protected function render() {
        $s = $this->get_settings_for_display();
        ?>
        <section id="ventures" class="ph-section">
            <div class="ph-container">

                <div style="max-width:560px;margin-bottom:var(--ph-space-lg);">
                    <?php if ( $s['section_label'] ) : ?>
                    <span class="ph-section-label ph-reveal"><?php echo esc_html( $s['section_label'] ); ?></span>
                    <?php endif; ?>
                    <?php if ( $s['title'] ) : ?>
                    <h2 class="ph-headline ph-reveal"><?php echo esc_html( $s['title'] ); ?></h2>
                    <?php endif; ?>
                    <?php if ( $s['description'] ) : ?>
                    <p class="ph-body ph-reveal" style="margin-top:1.5rem;"><?php echo esc_html( $s['description'] ); ?></p>
                    <?php endif; ?>
                </div>

                <div class="ph-ventures-grid ph-reveal-group">
                    <?php foreach ( $s['ventures'] as $v ) :
                        $img_url  = $v['image']['url'] ?? '';
                        $btn_url  = esc_url( $v['url']['url'] ?? '#' );
                        $target   = ! empty( $v['url']['is_external'] ) ? '_blank' : '_self';
                        $rel      = ! empty( $v['url']['is_external'] ) ? 'rel="noopener noreferrer"' : '';
                    ?>
                    <div class="ph-venture-card">
                        <?php if ( $img_url ) : ?>
                        <div class="ph-venture-card__image">
                            <img src="<?php echo esc_url( $img_url ); ?>" alt="<?php echo esc_attr( $v['name'] ); ?>" loading="lazy">
                        </div>
                        <?php endif; ?>
                        <div class="ph-venture-card__body">
                            <h3 class="ph-venture-card__name"><?php echo esc_html( $v['name'] ); ?></h3>
                            <?php if ( $v['desc'] ) : ?>
                            <p class="ph-venture-card__desc"><?php echo esc_html( $v['desc'] ); ?></p>
                            <?php endif; ?>
                            <?php if ( $v['btn_text'] && $btn_url ) : ?>
                            <a href="<?php echo $btn_url; ?>" target="<?php echo esc_attr( $target ); ?>" <?php echo $rel; ?> class="ph-btn ph-btn-external ph-magnetic">
                                <?php echo esc_html( $v['btn_text'] ); ?>
                            </a>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </div>

            </div>
        </section>
        <?php
    }
}
