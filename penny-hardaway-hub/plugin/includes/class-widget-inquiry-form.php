<?php
namespace Penny_Hub;

use Elementor\Widget_Base;
use Elementor\Controls_Manager;

if ( ! defined( 'ABSPATH' ) ) exit;

class Widget_Inquiry_Form extends Widget_Base {

    public function get_name()       { return 'ph_inquiry_form'; }
    public function get_title()      { return 'PH: Inquiry Form'; }
    public function get_icon()       { return 'eicon-form-horizontal'; }
    public function get_categories() { return [ 'penny-hub' ]; }

    protected function register_controls() {

        $this->start_controls_section( 'section_content', [
            'label' => 'Form Content',
            'tab'   => Controls_Manager::TAB_CONTENT,
        ] );

        $this->add_control( 'section_label', [
            'label'   => 'Section Label',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Connect',
        ] );
        $this->add_control( 'title', [
            'label'   => 'Title',
            'type'    => Controls_Manager::TEXT,
            'default' => "Let's Talk",
        ] );
        $this->add_control( 'description', [
            'label'   => 'Description',
            'type'    => Controls_Manager::TEXTAREA,
            'default' => 'For media, speaking, community, and business inquiries.',
        ] );
        $this->add_control( 'submit_label', [
            'label'   => 'Submit Button Label',
            'type'    => Controls_Manager::TEXT,
            'default' => 'Submit Inquiry',
        ] );

        $this->end_controls_section();
    }

    protected function render() {
        $s = $this->get_settings_for_display();
        ?>
        <section id="contact" class="ph-section">
            <div class="ph-container ph-contact-inner" style="display:grid;grid-template-columns:1fr 1.6fr;gap:6rem;align-items:start;">

                <div>
                    <?php if ( $s['section_label'] ) : ?>
                    <span class="ph-section-label ph-reveal"><?php echo esc_html( $s['section_label'] ); ?></span>
                    <?php endif; ?>
                    <?php if ( $s['title'] ) : ?>
                    <h2 class="ph-headline ph-reveal"><?php echo esc_html( $s['title'] ); ?></h2>
                    <?php endif; ?>
                    <hr class="ph-rule ph-reveal" aria-hidden="true">
                    <?php if ( $s['description'] ) : ?>
                    <p class="ph-body ph-reveal"><?php echo esc_html( $s['description'] ); ?></p>
                    <?php endif; ?>
                </div>

                <form id="ph-inquiry-form" class="ph-form ph-reveal" novalidate>
                    <?php wp_nonce_field( 'penny_hub_inquiry', 'nonce' ); ?>

                    <div class="ph-form-row-2">
                        <div class="ph-field">
                            <label for="ph-name">Name <span aria-hidden="true">*</span></label>
                            <input type="text" id="ph-name" name="name" placeholder="Full Name" required autocomplete="name">
                        </div>
                        <div class="ph-field">
                            <label for="ph-email">Email <span aria-hidden="true">*</span></label>
                            <input type="email" id="ph-email" name="email" placeholder="email@example.com" required autocomplete="email">
                        </div>
                    </div>

                    <div class="ph-field">
                        <label for="ph-org">Organization</label>
                        <input type="text" id="ph-org" name="organization" placeholder="Company / Organization" autocomplete="organization">
                    </div>

                    <div class="ph-field">
                        <label for="ph-reason">Reason for Inquiry</label>
                        <select id="ph-reason" name="reason">
                            <option value="" disabled selected>Select a category</option>
                            <option value="Media">Media</option>
                            <option value="Speaking">Speaking</option>
                            <option value="Community">Community</option>
                            <option value="Business">Business</option>
                            <option value="General">General</option>
                        </select>
                    </div>

                    <div class="ph-field">
                        <label for="ph-message">Message <span aria-hidden="true">*</span></label>
                        <textarea id="ph-message" name="message" placeholder="Tell us more..." required></textarea>
                    </div>

                    <div class="ph-form-status" role="alert" aria-live="polite"></div>

                    <button type="submit" class="ph-btn ph-btn-primary ph-magnetic" style="width:100%;justify-content:center;">
                        <?php echo esc_html( $s['submit_label'] ); ?>
                    </button>
                </form>

            </div>
        </section>
        <?php
    }
}
