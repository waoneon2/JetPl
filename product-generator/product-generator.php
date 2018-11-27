<?php
/**
 * Plugin Name: Oven Configurator
 * Plugin URI: http://mossyrock.us
 * Description: Customize your Woodstone Oven
 * Version: 2.2.1
 * Author: Mossyrock
 * Author http://mossyrock.us
 * License: GPLv2 or later
 * Text Domain:
 */

define('PRGEN_PLUGIN_DIR', plugin_dir_path(__FILE__));

define('PRGEN_PLUGIN_DIR_URL', plugin_dir_url(__FILE__));

define('PRGEN_TEMPLATE_DEBUG_MODE', defined('WP_DEBUG') ? WP_DEBUG : false);

function prgen_load_frontend_scripts()
{
    global $post;
    if (is_singular('prgen-products-conf') || is_post_type_archive('prgen-products-conf')
        || is_page(prgen_get_page_my_account()) || (!is_null($post) && has_shortcode($post->post_content, 'configurator'))) {
        wp_register_script('mithril', PRGEN_PLUGIN_DIR_URL . 'assets/js/lib/mithril.js', [], '2.0');
        // wp_enqueue_script('prgen-frontend', PRGEN_PLUGIN_DIR_URL . 'assets/js/frontend-scripts.js', array(
        //     'jquery',
        //     'mithril'
        // ), '');


        wp_enqueue_script('prgen-frontend', PRGEN_PLUGIN_DIR_URL . 'assets/js/bundled.js', [], '');
        wp_enqueue_script('prgen-frontend-scripts', PRGEN_PLUGIN_DIR_URL . 'assets/js/frontend-scripts.js', ['jquery'], '');

        $my_account = prgen_get_page_my_account();
        $my_account_url = home_url();
        if ($my_account) {
            $my_account_url = get_permalink(prgen_get_page_my_account());
        }
        // send ajax url
        wp_localize_script('prgen-frontend', 'prgen_frontend_settings', array(
            'ajaxurl'        => admin_url('admin-ajax.php'),
            'page'           => is_post_type_archive('prgen-products-conf') || has_shortcode($post->post_content, 'configurator') ? 'archive' : 'singular',
            'userId'         => get_current_user_id(),
            'loginNonce'     => wp_create_nonce('prgen_frontend_login'),
            'registerNonce'  => wp_create_nonce('prgen_frontend_register'),
            'saveNonce'      => wp_create_nonce('prgen_frontend_save_configuration'),
            'myAccount'      => $my_account_url,
            'defaultIcon'    => PRGEN_PLUGIN_DIR_URL . 'assets/images/white_box.png',
            'prgenPageURL'   => get_permalink(prgen_get_page_configurator())
        ));

        // css
        wp_enqueue_style('prgen-frontend', PRGEN_PLUGIN_DIR_URL . 'assets/css/frontend.css');
    }
}

function prgen_do_install() {
    $my_account = prgen_get_page_my_account();
    if (!$my_account) {
        wp_insert_post([
            'post_title' => __('My Account', 'prgen'),
            'post_content' => '[prgen-user-account]',
            'post_type'    => 'page',
            'post_status'  => 'publish'
        ]);
    }
}

function prgen_plugin_load()
{
    require __DIR__ . '/includes/utils.php';
    require __DIR__ . '/includes/db.php';
    require __DIR__ . '/includes/post-types.php';
    require __DIR__ . '/includes/templates.php';

    // instalation
    register_activation_hook(__FILE__, 'prgen_do_install');

    if (is_admin()) {

        require __DIR__ . '/admin/admin.php';
    } else {

        add_action('wp_enqueue_scripts', 'prgen_load_frontend_scripts');
    }

    if (defined('DOING_AJAX')) {

        require __DIR__ . '/ajax.php';
    }
}

if (defined('PRGEN_LATE_LOAD') && PRGEN_LATE_LOAD) {
    // if PGEN_LATE_LOAD defined and it set to true, then load our plugin in ```plugins_loaded```
    // so other plugins have opportunity to load first
    add_action('plugins_loaded', 'prgen_plugin_load');
} else {
    // otherwise, call it directly
    prgen_plugin_load();
}