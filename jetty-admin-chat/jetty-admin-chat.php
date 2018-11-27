<?php
/**
 * @package Jetty Admin Chat
 * @version 1.0
 */
/*
Plugin Name: Jetty Admin Chat
Plugin URI: https://jettyapp.com/
Description: Jetty Admin Chat
Author: Jetty Team
Version: 1.0
Author URI: https://jettyapp.com/
Text Domain: jchat

*/
if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
// Required if your environment does not handle autoloading
require plugin_dir_path( __FILE__ ) . '/vendor/autoload.php';

use Twilio\Rest\Client;
use Twilio\Jwt\AccessToken;
use Twilio\Jwt\Grants\ChatGrant;

$options          = NULL;
$options_two      = NULL;
$options_three    = NULL;
$error_notif      = '';
$services_arr     = [];
$bol_not_set      = FALSE;
$bol_on_settings  = TRUE;
$bol_other_settings = TRUE;
$bol_empty_service  = FALSE;
$bol_set_api_key = FALSE;
$default_service_sid    = get_option('jchat_default_service_sid', '' );
$default_key_sid        = get_option('jchat_default_key_sid', '' );
$default_key_secret     = get_option('jchat_default_key_secret', '' );
$sid = NULL;
$token = NULL;
$on_submit = FALSE;
$services_arr_id = [];

define("JCHAT_DEFAULT_SERVICE_NAME", "Jetty Default Service", true);
define("JCHAT_DEFAULT_API_KEY_NAME", "User Jetty Team", true);

if(is_multisite()){
    $current_site = get_current_site();
    if(get_option('twilio_subaccount_' . $current_site->id) === FALSE && get_option('twilio_authtoken_' . $current_site->id) === FALSE){
        if(defined('TWILIO_ACCOUNTSID') && defined('TWILIO_AUTHTOKEN')){
            $sid     = TWILIO_ACCOUNTSID;
            $token   = TWILIO_AUTHTOKEN;
            $bol_on_settings = FALSE;
        } else {
            $sid    = isset( get_option( 'jchat_option_name' )['twilio_accountsid']) ? esc_attr( get_option( 'jchat_option_name' )['twilio_accountsid']) : '';
            $token  = isset( get_option( 'jchat_option_name' )['twilio_authtoken']) ? esc_attr( get_option( 'jchat_option_name' )['twilio_authtoken']) : '';
            $bol_on_settings = TRUE;
        } 
    } else {
        $sid    = get_option('twilio_subaccount_' . $current_site->id);
        $token  = get_option('twilio_authtoken_' . $current_site->id);
        $bol_on_settings = FALSE;
    }
} else {
    if(defined('TWILIO_ACCOUNTSID') && defined('TWILIO_AUTHTOKEN')){
        $sid     = TWILIO_ACCOUNTSID;
        $token   = TWILIO_AUTHTOKEN;
        $bol_on_settings = FALSE;
    } else {
        $sid    = isset( get_option( 'jchat_option_name' )['twilio_accountsid']) ? esc_attr( get_option( 'jchat_option_name' )['twilio_accountsid']) : '';
        $token  = isset( get_option( 'jchat_option_name' )['twilio_authtoken']) ? esc_attr( get_option( 'jchat_option_name' )['twilio_authtoken']) : '';
        $bol_on_settings = TRUE;
    } 
}


if(empty(get_option( 'jchat_option_name' )['twilio_accountsid']) || empty(get_option( 'jchat_option_name_three' )['twilio_api_key_three']) || empty(get_option( 'jchat_option_name_three' )['twilio_api_secret_three'])){
    $bol_other_settings = FALSE;
}

if( (empty($sid) && empty($token)) && (empty($sid) || empty($token)) ){
    $bol_not_set = TRUE;
}

if(!$bol_not_set):
try {
	$client = new Client($sid, $token);
    $services = $client->chat->services->read();
    $fetch_key = $client->keys->read();

    if(empty($fetch_key)){
        $key = $client->newKeys->create(
            array('friendlyName' => JCHAT_DEFAULT_API_KEY_NAME)
        );

        $options_three['twilio_api_key_three'] = $key->sid;
        $options_three['twilio_api_secret_three'] = $key->secret;

        update_option('jchat_option_name_three', $options_three);

        update_option('jchat_default_key_sid', $key->sid );
        update_option('jchat_default_key_secret', $key->secret );
        $bol_set_api_key = FALSE;
        $bol_other_settings = TRUE;
    } else {
        $arr_key = [];
        $ji = 0;

        foreach ($fetch_key as $fkey) {
            $arr_key[$ji] = $fkey->sid;
            $ji++;
        }

        if(in_array($default_key_sid, $arr_key)){

        } else {
            $key_new = $client->newKeys->create(
                array('friendlyName' => JCHAT_DEFAULT_API_KEY_NAME)
            );

            $options_three['twilio_api_key_three'] = $key_new->sid;
            $options_three['twilio_api_secret_three'] = $key_new->secret;

            update_option('jchat_option_name_three', $options_three);

            update_option('jchat_default_key_sid', $key_new->sid );
            update_option('jchat_default_key_secret', $key_new->secret );
        }
        $bol_other_settings = TRUE;
        $bol_set_api_key = TRUE;
    }

    if(!empty($services)){
        $bol_empty_service = FALSE;
        $int_num = 0;
        foreach ($services as $service) {
            $services_arr[$service->friendlyName] = $service->sid;
            $services_arr_id[$int_num] = $service->sid;
            $int_num++;
        }
    } else {
        $bol_empty_service = TRUE;
        $create_service = $client->chat->services->create(JCHAT_DEFAULT_SERVICE_NAME);
        $services_from_create = $client->chat->services->read();
        foreach ($services_from_create as $service) {
            $services_arr[$service->friendlyName] = $service->sid;
        }
        $options_two['twilio_service_instance_sid_two'] = $create_service->sid;
        update_option( 'jchat_option_name_two', $options_two);
    }

    if(get_option( 'jchat_option_name_two' ) === FALSE || empty(get_option( 'jchat_option_name_two' ))) {
        if(!empty($services_arr)){
            $first_choose = array_values($services_arr)[0];
            update_option('jchat_default_service_sid', $first_choose );
        }
    } else {
        if(!in_array(get_option( 'jchat_option_name_two' )['twilio_service_instance_sid_two'], $services_arr_id)){
            $f_t = $services_arr_id[0];
            $options_two['twilio_service_instance_sid_two'] = $f_t;
            update_option( 'jchat_option_name_two', $options_two);
        }
    }
} catch (Exception $e) {
	$error_notif = 'Caught exception: '.$e->getMessage();
}
endif;

function jchat_ajax_url(){
    $ajaxUrl = site_url().'/wp-admin/admin-ajax.php';
    return $ajaxUrl;
}

function jchat_handle_ajax_req(){
    global $default_key_sid, $default_key_secret, $default_service_sid, $sid;

    $user = wp_get_current_user();
    $appName = 'JettyAdminChat';

    $identity = $user->user_email;

    $userEmail = $user->user_email;

    $userAvatarUrl = esc_url( get_avatar_url( $user->ID ) );

    $endpointId = $appName . ':' . $identity . ':' . $userEmail;

    if(!empty(get_option( 'jchat_option_name_three' )['twilio_api_key_three']) && !empty(get_option( 'jchat_option_name_three' )['twilio_api_secret_three'])){
        $token = new AccessToken(
            $sid,
            get_option( 'jchat_option_name_three' )['twilio_api_key_three'],
            get_option( 'jchat_option_name_three' )['twilio_api_secret_three'],
            3600,
            $identity
        );
    } else {
        $token = new AccessToken(
            $sid,
            $default_key_sid,
            $default_key_secret,
            3600,
            $identity
        );
    }

    // Grant access to Chat
    if (!empty(get_option( 'jchat_option_name_two' )['twilio_service_instance_sid_two'])) {
        $chatGrant = new ChatGrant();
        $chatGrant->setServiceSid(get_option( 'jchat_option_name_two' )['twilio_service_instance_sid_two']);
        $chatGrant->setEndpointId($endpointId);
        $token->addGrant($chatGrant);
    } else {
        $chatGrant = new ChatGrant();
        $chatGrant->setServiceSid($default_service_sid);
        $chatGrant->setEndpointId($endpointId);
        $token->addGrant($chatGrant);
    }

    header('Content-type:application/json;charset=utf-8');
    echo json_encode(array(
        'identity' => $identity,
        'token' => $token->toJWT(),
        'userEmail' => $userEmail,
        'userAvatarUrl' => $userAvatarUrl
    ));
    die();
}
add_action( 'wp_ajax_jchat_handle_ajax_req', 'jchat_handle_ajax_req' );

function jchat_enqueue_scripts(){
    $screen = get_current_screen();

	wp_enqueue_style( 'jchat-style', plugins_url( 'assets/admin/css/jchat_style.css', __FILE__ ), array(), '1.0.0' );

    if($screen->id == 'toplevel_page_jchat_area'){
        wp_enqueue_script( 'jchat-twilio-common', 'https://media.twiliocdn.com/sdk/js/common/v0.1/twilio-common.min.js', array(), '0.1', true );
        wp_enqueue_script( 'jchat-twilio-chat', 'https://media.twiliocdn.com/sdk/js/chat/v1.2/twilio-chat.min.js', array(), '1.2', true );
        wp_enqueue_script( 'jchat-area-script', plugins_url( 'assets/admin/js/jchat_area.js', __FILE__ ), array('jquery'), '1.0', true );
        wp_localize_script( 'jchat-area-script', 'jchat_ajax_action', array(
            'ajax_url' => jchat_ajax_url()
        ));
    }
    wp_enqueue_script( 'jchat-setting-script', plugins_url( 'assets/admin/js/jchat_script.js', __FILE__ ), array('jquery'), '1.0', true );
}
add_action( 'admin_enqueue_scripts', 'jchat_enqueue_scripts' );

function jchat_add_plugin_page(){
    global $error_notif, $bol_not_set, $bol_other_settings;
	add_submenu_page(
        'options-general.php', 
        'Chat Settings',
        'Chat Settings',
        'manage_options', 
        'jchat-twilio-settings', 
        'create_register_twilio_callback'
    );
    if($bol_other_settings):
        if(!$bol_not_set):
            if(empty($error_notif)){
                add_menu_page('Admin Chat', 'Admin Chat', 'manage_options','jchat_area', 'jchat_chat_area_callback', 'dashicons-format-chat', 25);
            }
        endif;
    endif;
    
}
add_action( 'admin_menu', 'jchat_add_plugin_page');

function jchat_chat_area_callback(){
    ?>
    <div class="wrap">
        <h1>Chat Area</h1>
        <section id="jchat_admin_chat">
            <div id="jchat_messages"></div>
            <textarea id="chat-input" placeholder="Your message..."></textarea>
        </section>
    </div>
    <?php
}

function create_register_twilio_callback(){
	global $options, $error_notif, $options_two, $options_three, $bol_not_set, $bol_on_settings, $services_arr;
    // Set class property
    $options = get_option( 'jchat_option_name' );
    $options_two = get_option( 'jchat_option_name_two' );
    $options_three = get_option( 'jchat_option_name_three' );

    if($options_two === FALSE || empty($options_two)) {
        if(!empty($services_arr)){
            $first_choose = array_values($services_arr)[0];
            update_option('jchat_default_service_sid', $first_choose );
        }
    }

    ?>
    <div class="wrap">
    	<?php 
    		$msg = (!empty($error_notif)) ? '<span class="error_notif">'.$error_notif.'</span>' : ''; 
    		echo $msg;
    	?>
        <h1>Chat Settings</h1>
        <?php 
            if($bol_on_settings):
                $active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'jchat_account_auth';
            else:
                $active_tab = isset( $_GET[ 'tab' ] ) ? $_GET[ 'tab' ] : 'jchat_service_sid';
            endif;
        ?> 
        <h2 class="nav-tab-wrapper"> 
        <?php 
            if($bol_on_settings):
        ?>
            <a href="?page=jchat-twilio-settings&tab=jchat_account_auth" class="nav-tab <?php echo $active_tab == 'jchat_account_auth' ? 'nav-tab-active' : ''; ?>">Account SID & Auth Token Options</a>
        <?php
            endif;
        ?>
        <?php
        if(!$bol_not_set):
            if(empty($error_notif)): 
        ?>
            <a href="?page=jchat-twilio-settings&tab=jchat_service_sid" class="nav-tab <?php echo $active_tab == 'jchat_service_sid' ? 'nav-tab-active' : ''; ?>">Service Instance SID Options</a>
            <a href="?page=jchat-twilio-settings&tab=jchat_api_key_secret" class="nav-tab <?php echo $active_tab == 'jchat_api_key_secret' ? 'nav-tab-active' : ''; ?>">API Key & API Secret Options</a>
        <?php 
            endif;
        endif;
        ?>
        </h2>
        <form method="post" action="options.php">
        <?php
            if($active_tab == 'jchat_account_auth'){
                settings_fields( 'jchat_option_group' );
                do_settings_sections( 'jchat-twilio-settings' );
            } 
            else if( $active_tab == 'jchat_service_sid' ) {
                settings_fields( 'jchat_option_group_two' );
                do_settings_sections( 'jchat-twilio-settings-two' );
            } 
            else if( $active_tab == 'jchat_api_key_secret' ) {
                settings_fields( 'jchat_option_group_three' );
                do_settings_sections( 'jchat-twilio-settings-three' );
            }
            submit_button();
        ?>
        </form>
    </div>
    <?php
}

function jchat_page_init(){
    // Account SID & Auth Token Options
	register_setting(
        'jchat_option_group',
        'jchat_option_name',
        'sanitize'
    );
    add_settings_section(
        'setting_section_id', 
        '',
        'print_section_info',
        'jchat-twilio-settings'
    );  
    add_settings_field(
        'twilio_accountsid', 
        'Account SID',
        'jchat_twilio_accountsid_callback',
        'jchat-twilio-settings',
        'setting_section_id'       
    );      
    add_settings_field(
        'twilio_authtoken', 
        'Auth Token', 
        'jchat_twilio_authtoken_callback', 
        'jchat-twilio-settings', 
        'setting_section_id'
    );

    // Service Instance SID Options
    register_setting(
        'jchat_option_group_two',
        'jchat_option_name_two',
        'sanitize'
    );
    add_settings_section(
        'setting_section_id_two', 
        '',
        'print_section_info',
        'jchat-twilio-settings-two'
    );  
    add_settings_field(
        'twilio_service_instance_sid_two', 
        'Service Instance SID',
        'jchat_twilio_service_instance_sid_callback',
        'jchat-twilio-settings-two',
        'setting_section_id_two'       
    );

    // API Key & API Secret Options
    register_setting(
        'jchat_option_group_three',
        'jchat_option_name_three',
        'sanitize'
    );
    add_settings_section(
        'setting_section_id_three', 
        '',
        'print_section_info',
        'jchat-twilio-settings-three'
    );  
    add_settings_field(
        'twilio_api_key_three', 
        'API Key', 
        'jchat_twilio_api_key_callback', 
        'jchat-twilio-settings-three', 
        'setting_section_id_three'
    );
    add_settings_field(
        'twilio_api_secret_three', 
        'API Secret', 
        'jchat_twilio_api_secret_callback', 
        'jchat-twilio-settings-three', 
        'setting_section_id_three'
    );
}
add_action( 'admin_init', 'jchat_page_init' );

function sanitaze($input){
	$new_input = array();
    if( isset( $input['twilio_accountsid'] ) )
        $new_input['twilio_accountsid'] = sanitize_text_field( $input['twilio_accountsid'] );
    if( isset( $input['twilio_authtoken'] ) )
        $new_input['twilio_authtoken'] = sanitize_text_field( $input['twilio_authtoken'] );
    if( isset( $input['twilio_service_instance_sid_two'] ) )
        $new_input['twilio_service_instance_sid_two'] = sanitize_text_field( $input['twilio_service_instance_sid_two'] );
    if( isset( $input['twilio_api_key_three'] ) )
        $new_input['twilio_api_key_three'] = sanitize_text_field( $input['twilio_api_key_three'] );
    if( isset( $input['twilio_api_secret_three'] ) )
        $new_input['twilio_api_secret_three'] = sanitize_text_field( $input['twilio_api_secret_three'] );
    return $new_input;
}

function print_section_info(){
    // print 'Enter your Twilio Account below:';
}

function jchat_twilio_accountsid_callback(){
	global $options;
	printf(
        '<input type="text" id="twilio_accountsid" name="jchat_option_name[twilio_accountsid]" value="%s" />',
        isset( $options['twilio_accountsid'] ) ? esc_attr( $options['twilio_accountsid']) : ''
    );
}

function jchat_twilio_authtoken_callback(){
	global $options;
	printf(
        '<input type="text" id="twilio_authtoken" name="jchat_option_name[twilio_authtoken]" value="%s" />',
        isset( $options['twilio_authtoken'] ) ? esc_attr( $options['twilio_authtoken']) : ''
    );
}

function jchat_twilio_service_instance_sid_callback(){
    global $options_two, $services_arr, $bol_empty_service, $default_service_sid;
    if(!empty($services_arr)){
        echo "<select id='twilio_service_instance_sid_two' name='jchat_option_name_two[twilio_service_instance_sid_two]'>";
            foreach($services_arr as $name => $serviceID) {
                if($bol_empty_service){
                    $selected = ($default_service_sid == $serviceID) ? 'selected="selected"' : '';
                } else {
                    $selected = ($options_two['twilio_service_instance_sid_two'] == $serviceID) ? 'selected="selected"' : '';
                }
                echo "<option value='$serviceID' $selected>$name</option>";
            }
        echo "</select>";
    }
}

function jchat_twilio_api_key_callback(){
    global $options_three, $default_key_sid, $bol_set_api_key;
    printf(
        '<input type="text" id="twilio_api_key_three" name="jchat_option_name_three[twilio_api_key_three]" value="%s" />',
        isset( $options_three['twilio_api_key_three'] ) ? esc_attr( $options_three['twilio_api_key_three']) : $default_key_sid
    );
}

function jchat_twilio_api_secret_callback(){
    global $options_three, $default_key_secret, $bol_set_api_key;
    printf(
        '<input type="text" id="twilio_api_secret_three" name="jchat_option_name_three[twilio_api_secret_three]" value="%s" />',
        isset( $options_three['twilio_api_secret_three'] ) ? esc_attr( $options_three['twilio_api_secret_three']) : $default_key_secret
    );
}

function jchat_plugin_add_settings_link( $links ) {
    $settings_link = '<a href="options-general.php?page=jchat-twilio-settings">' . __( 'Settings' ) . '</a>';
    array_push( $links, $settings_link );
    return $links;
}
$plugin = plugin_basename( __FILE__ );
add_filter( "plugin_action_links_$plugin", 'jchat_plugin_add_settings_link' );
?>