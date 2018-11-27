<?php
/*
Plugin Name: Jetty Image Widget
Plugin URI: http://eresources.com/
Description: Jetty Image widget
Version: 0.0.1
Author: Jetty Team
Author URI: http://eresources.com/
License: GPLv2 or later
Text Domain: jiw
*/

require __DIR__ . '/class-jetty-image-widget.php';

// register the widget
function jiw_register_widgets() {
    register_widget('Jetty_Image_Widget');
}

add_action('widgets_init', 'jiw_register_widgets');

function jiw_enqueue_admin_scripts() {
    global $pagenow;
    $url = plugin_dir_url(__FILE__);
    // register first, so other code can enqueue it by name if needed
    wp_register_script('jiw-admin-uploader', $url . 'assets/js/jetty-image-widget.js', array('jquery'));
    wp_register_style('jiw-admin-uploader', $url . 'assets/css/jetty-image-widget.css');
    wp_localize_script('jiw-admin-uploader', 'jiw_admin_uploader_i18n', array(
        'title' => __('Upload or Select an Image', 'jiw'),
        'text'  => __('Select', 'jiw'),
        'btn_text' => __('Upload', 'jiw'),
        'remove_text' => __('Remove', 'jiw'),
        'label_url' => __( 'Link URL', 'jiw' )
    ));
    // only loads our scripts on widgets page and customizer
    if (in_array($pagenow,  array('widgets.php', 'customize.php'))) {
        wp_enqueue_media();
        wp_enqueue_script('jiw-admin-uploader');
        wp_enqueue_style('jiw-admin-uploader');
    }
}

add_action('admin_enqueue_scripts', 'jiw_enqueue_admin_scripts');

function jiw_enqueue_scripts() {
    $url = plugin_dir_url(__FILE__);
    wp_enqueue_style('jiw-frontend', $url . '/assets/css/jiw-frontend.css');
}

add_action('wp_enqueue_scripts', 'jiw_enqueue_scripts');