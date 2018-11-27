<?php
/**
 * @package Jetty AWS S3 Bucket
 * @version 1.0
 */
/*
Plugin Name: Jetty AWS S3 Bucket
Plugin URI: https://jettyapp.com/
Description: Plugin for storing files in an AWS S3 bucket. This is kind of like a private DropBox.
Author: Jetty Team
Version: 1.0
Author URI: https://jettyapp.com/
Text Domain: jbucket

*/
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// Required if your environment does not handle autoloading
require plugin_dir_path( __FILE__ ) . '/vendor/autoload.php';

use Aws\Credentials\CredentialProvider;
use Aws\S3\S3Client;
use Aws\Exception\AwsException;
use Aws\S3\Exception\S3Exception;

// Use the default credential provider
$provider = CredentialProvider::defaultProvider();


$options = NULL;
$jbucket_error_notif = '';

$key = isset(get_option('jbucket_credentials_settings')['jbucket_aws_access_key_id']) && !empty(get_option('jbucket_credentials_settings')['jbucket_aws_access_key_id']);
$secret = isset(get_option('jbucket_credentials_settings')['jbucket_aws_secret_access_key']) && !empty(get_option('jbucket_credentials_settings')['jbucket_aws_secret_access_key']);

if($key && $secret){
    try{
        $client = new S3Client([
            'region'      => 'us-west-2',
            'version'     => 'latest',
            'credentials' => [
                'key'    => $key,
                'secret' => $secret,
            ],
        ]);
        $buckets = $client->listBuckets();
        foreach ($buckets['Buckets'] as $bucket){
            echo $bucket['Name']."\n";
        }
    } catch (S3Exception $e) {
        $jbucket_error_notif = 'Caught exception: '.$e->getMessage();

    } catch (AwsException $e) {
        $jbucket_error_notif = 'Caught exception: '.$e->getAwsRequestId() . "\n" .$e->getAwsErrorType() . "\n" .$e->getAwsErrorCode() . "\n";
    }
}

function jbucket_settings_page(){
	add_submenu_page(
        'options-general.php', 
        'Jetty AWS Bucket Credentials',
        'Jetty AWS Bucket Credentials',
        'manage_options', 
        'jbucket-credentials-settings', 
        'jbucket_credentials_settings_callback'
    );
}
add_action( 'admin_menu', 'jbucket_settings_page');


function jbucket_credentials_settings_callback(){
	global $options, $jbucket_error_notif;

	$options = get_option('jbucket_credentials_settings');

	?>

	<div class="wrap">
        <?php 
            $msg = (!empty($jbucket_error_notif)) ? '<span class="jbucket_error_notif">'.$jbucket_error_notif.'</span>' : ''; 
            echo $msg;
        ?>
		<form method="post" action="options.php">
			<?php
				settings_fields('jbucket_credentials_settings_group');
				do_settings_sections('jbucket-credentials-settings');
				submit_button();
			?>
		</form>
	</div>
	<?php
}

function jbucket_fields_init(){
	register_setting(
        'jbucket_credentials_settings_group',
        'jbucket_credentials_settings',
        'jbucket_sanitize'
    );
    add_settings_section(
        'jbucket_setting_section_credentials', 
        'AWS S3 Credentials',
        'jbucket_print_section_info',
        'jbucket-credentials-settings'
    );  
    add_settings_field(
        'jbucket_aws_access_key_id', 
        'AWS Access Key ID',
        'jbucket_aws_access_key_id_callback',
        'jbucket-credentials-settings',
        'jbucket_setting_section_credentials'       
    );      
    add_settings_field(
        'jbucket_aws_secret_access_key', 
        'AWS Secret Access Key', 
        'jbucket_aws_secret_access_key_callback', 
        'jbucket-credentials-settings', 
        'jbucket_setting_section_credentials'
    );
}
add_action( 'admin_init', 'jbucket_fields_init' );

function jbucket_print_section_info(){
	print 'Enter your AWS Credentials Account below:';
}

function jbucket_sanitize($input){
	$new_input = array();
    if( isset( $input['jbucket_aws_access_key_id'] ) )
        $new_input['jbucket_aws_access_key_id'] = sanitize_text_field( $input['jbucket_aws_access_key_id'] );
    if( isset( $input['jbucket_aws_secret_access_key'] ) )
        $new_input['jbucket_aws_secret_access_key'] = sanitize_text_field( $input['jbucket_aws_secret_access_key'] );
    return $new_input;
}

function jbucket_aws_access_key_id_callback(){
	global $options;
	printf(
        '<input type="text" id="jbucket_aws_access_key_id" name="jbucket_credentials_settings[jbucket_aws_access_key_id]" value="%s" />',
        isset( $options['jbucket_aws_access_key_id'] ) ? esc_attr( $options['jbucket_aws_access_key_id']) : ''
    );
}

function jbucket_aws_secret_access_key_callback(){
	global $options;
	printf(
        '<input type="text" id="jbucket_aws_secret_access_key" name="jbucket_credentials_settings[jbucket_aws_secret_access_key]" value="%s" />',
        isset( $options['jbucket_aws_secret_access_key'] ) ? esc_attr( $options['jbucket_aws_secret_access_key']) : ''
    );
}

function jbucket_enqueue_scripts(){
    $screen = get_current_screen();

    wp_enqueue_style( 'jbucket-style', plugins_url( 'assets/admin/css/jbucket_style.css', __FILE__ ), array(), '1.0.0' );

    wp_enqueue_script( 'jbucket-settings-script', plugins_url( 'assets/admin/js/jbucket_script.js', __FILE__ ), array('jquery'), '1.0', true );
}
add_action( 'admin_enqueue_scripts', 'jbucket_enqueue_scripts' );

function jbucket_plugin_add_settings_link( $links ) {
    $settings_link = '<a href="options-general.php?page=jbucket-credentials-settings">' . __( 'Settings' ) . '</a>';
    array_push( $links, $settings_link );
    return $links;
}
$plugin = plugin_basename( __FILE__ );
add_filter( "plugin_action_links_$plugin", 'jbucket_plugin_add_settings_link' );

?>