<?php
/*
Plugin Name: Jetty Readiness Level
Plugin URI: http://eresources.com/
Description: Jetty Readiness Level Widget
Version: 1.0.0
Author: Jetty Team
Author URI: http://eresources.com/
License: GPLv2 or later
Text Domain: jrlw
*/

require __DIR__ . '/inc/class-jetty-readiness-widget.php';
require __DIR__ . '/inc/class-jetty-readiness-setting.php';

function jrlw_register_widgets() {
    register_widget('Jetty_Readiness_Level_Widget');
}
add_action('widgets_init', 'jrlw_register_widgets');

function jrlw_enqueue_admin_scripts() {
    global $pagenow;
    $url = plugin_dir_url(__FILE__);
    // register first, so other code can enqueue it by name if needed
    wp_register_script('jrlw-admin-setting', $url . 'assets/js/jrlw-setting.js', array('jquery'));
    wp_register_style('jrlw-admin-setting', $url . 'assets/css/jrlw-setting.css');

    wp_localize_script('jrlw-admin-readiness', 'jrlw_admin_readiness_i18n', array(
        '' => __('', 'jrlw'),
    ));
    // only loads our scripts on widgets page and customizer
    if (in_array($pagenow,  array('options-general.php'))) {
        wp_enqueue_script('jrlw-admin-setting');
        wp_enqueue_style('jrlw-admin-setting');
        // Css rules for Color Picker
        wp_enqueue_script( 'jrlw-admin-color', $url . 'assets/js/jrlw-color.js', array( 'wp-color-picker' ), false, true );
        wp_enqueue_style( 'wp-color-picker');
    }
}

add_action('admin_enqueue_scripts', 'jrlw_enqueue_admin_scripts');

function jrlw_enqueue_scripts() {
    $url = plugin_dir_url(__FILE__);
    wp_enqueue_style('jrlw-frontend', $url . '/assets/css/jrlw-frontend.css');
    wp_enqueue_script( 'jrlw-frontend-setting',  $url . 'assets/js/jrlw-frontend.js', array(),'', true );
}

add_action('wp_enqueue_scripts', 'jrlw_enqueue_scripts');
