<?php
/**
 * The WordPress Plugin Boilerplate.
 *
 * A foundation off of which to build well-documented WordPress plugins that
 * also follow WordPress Coding Standards and PHP best practices.
 *
 * @package   Jetty_Alerts
 * @author    Chad Baron <chad@jettyapp.com>
 * @license   GPL-2.0+
 * @link      http://jettyapp.com
 * @copyright 2014 Jetty
 *
 * @wordpress-plugin
 * Plugin Name:       Jetty Alerts
 * Plugin URI:        
 * Description:       Use available triggers and actions to set custom alerts.
 * Version:           1.0.0
 * Author:            Chad Baron
 * Author URI:        http://jettyapp.com
 * Text Domain:       
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/*----------------------------------------------------------------------------*
 * Public-Facing Functionality
 *----------------------------------------------------------------------------*/

/*
 * @TODO:
 *
 * - replace `class-plugin-name.php` with the name of the plugin's class file
 *
 */
require_once( plugin_dir_path( __FILE__ ) . 'public/class-jetty-alerts.php' );
require_once( plugin_dir_path( __FILE__ ) . 'admin/class-jetty-alerts-admin.php' );
add_action( 'plugins_loaded', array( 'Jetty_Alerts_Admin', 'get_instance' ) );


/*
 * Register hooks that are fired when the plugin is activated or deactivated.
 * When the plugin is deleted, the uninstall.php file is loaded.
 *
 * @TODO:
 *
 * - replace Plugin_Name with the name of the class defined in
 *   `class-plugin-name.php`
 */
register_activation_hook( __FILE__, array( 'Jetty_Alerts', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Jetty_Alerts', 'deactivate' ) );


add_action( 'plugins_loaded', array( 'Jetty_Alerts', 'get_instance' ) );

/*----------------------------------------------------------------------------*
 * Dashboard and Administrative Functionality
 *----------------------------------------------------------------------------*/

/*
 * @TODO:
 *
 * - replace `class-plugin-name-admin.php` with the name of the plugin's admin file
 * - replace Plugin_Name_Admin with the name of the class defined in
 *   `class-plugin-name-admin.php`
 *
 * If you want to include Ajax within the dashboard, change the following
 * conditional to:
 *
 * if ( is_admin() ) {
 *   ...
 * }
 *
 * The code below is intended to to give the lightest footprint possible.
 */
if ( is_admin() && ( ! defined( 'DOING_AJAX' ) || ! DOING_AJAX ) ) {


}
