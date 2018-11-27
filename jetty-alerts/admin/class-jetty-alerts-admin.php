<?php
/**
 * Jetty Alerts.
 *
 * @package   Jetty_Alerts
 * @author    Chad Baron <chad@jettyapp.com>
 * @license   GPL-2.0+
 * @link      http://jettyapp.com
 * @copyright 2014 Jetty
 */

/**
 * Plugin class. This class should ideally be used to work with the
 * administrative side of the WordPress site.
 *
 * If you're interested in introducing public-facing
 * functionality, then refer to `class-plugin-name.php`
 *
 * @TODO: Rename this class to a proper name for your plugin.
 *
 * @package Plugin_Name_Admin
 * @author  Your Name <email@example.com>
 */
class Jetty_Alerts_Admin {

	/**
	 * Instance of this class.
	 *
	 * @since    1.0.0
	 *
	 * @var      object
	 */
	protected static $instance = null;

	/**
	 * Slug of the plugin screen.
	 *
	 * @since    1.0.0
	 *
	 * @var      string
	 */
	protected $plugin_screen_hook_suffix = null;


	/**
	 * Initialize the plugin by loading admin scripts & styles and adding a
	 * settings page and menu.
	 *
	 * @since     1.0.0
	 */
	private function __construct() {

		/*
		 * @TODO :
		 *
		 * - Uncomment following lines if the admin class should only be available for super admins
		 */
		/* if( ! is_super_admin() ) {
			return;
		} */

		/*
		 * Call $plugin_slug from public plugin class.
		 *
		 * @TODO:
		 *
		 * - Rename "Plugin_Name" to the name of your initial plugin class
		 *
		 */
		$plugin = Jetty_Alerts::get_instance();
		$this->plugin_slug = $plugin->get_plugin_slug();
		
		// Load admin style sheet and JavaScript.
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_styles' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_scripts' ) );

		// Add the options page and menu item.
		add_action( 'admin_menu', array( $this, 'add_plugin_admin_menu' ) );

		// Add an action link pointing to the options page.
		$plugin_basename = plugin_basename( plugin_dir_path( __DIR__ ) . $this->plugin_slug . '.php' );
		add_filter( 'plugin_action_links_' . $plugin_basename, array( $this, 'add_action_links' ) );
		
	}

	/**
	 * Return an instance of this class.
	 *
	 * @since     1.0.0
	 *
	 * @return    object    A single instance of this class.
	 */
	public static function get_instance() {

		/*
		 * @TODO :
		 *
		 * - Uncomment following lines if the admin class should only be available for super admins
		 */
		/* if( ! is_super_admin() ) {
			return;
		} */

		// If the single instance hasn't been set, set it now.
		if ( null == self::$instance ) {
			self::$instance = new self;
		}

		return self::$instance;
	}

	/**
	 * Register and enqueue admin-specific style sheet.
	 *
	 * @TODO:
	 *
	 * - Rename "Plugin_Name" to the name your plugin
	 *
	 * @since     1.0.0
	 *
	 * @return    null    Return early if no settings page is registered.
	 */
	public function enqueue_admin_styles() {

		if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $this->plugin_screen_hook_suffix == $screen->id ) {
			wp_enqueue_style( $this->plugin_slug .'-admin-styles', plugins_url( 'assets/css/admin.css', __FILE__ ), array(), Jetty_Alerts::VERSION );
		}

	}

	/**
	 * Register and enqueue admin-specific JavaScript.
	 *
	 * @TODO:
	 *
	 * - Rename "Plugin_Name" to the name your plugin
	 *
	 * @since     1.0.0
	 *
	 * @return    null    Return early if no settings page is registered.
	 */
	public function enqueue_admin_scripts() {

		if ( ! isset( $this->plugin_screen_hook_suffix ) ) {
			return;
		}

		$screen = get_current_screen();
		if ( $this->plugin_screen_hook_suffix == $screen->id ) {
			wp_enqueue_script( $this->plugin_slug . '-admin-script', plugins_url( 'assets/js/admin.js', __FILE__ ), array( 'jquery' ), Jetty_Alerts::VERSION );
		}

	}

	/**
	 * Register the administration menu for this plugin into the WordPress Dashboard menu.
	 *
	 * @since    1.0.0
	 */
	public function add_plugin_admin_menu() {

		/*
		 * Add a settings page for this plugin to the Settings menu.
		 *
		 * NOTE:  Alternative menu locations are available via WordPress administration menu functions.
		 *
		 *        Administration Menus: http://codex.wordpress.org/Administration_Menus
		 *
		 * @TODO:
		 *
		 * - Change 'Page Title' to the title of your plugin admin page
		 * - Change 'Menu Text' to the text for menu item for the plugin settings page
		 * - Change 'manage_options' to the capability you see fit
		 *   For reference: http://codex.wordpress.org/Roles_and_Capabilities
		 */
		
		$this->plugin_screen_hook_suffix = add_submenu_page( 
			'tools.php',
			__( 'Jetty Alerts Options', $this->plugin_slug ),
			__( 'Alerts Options', $this->plugin_slug ),
			'manage_options',
			$this->plugin_slug,
			array( $this, 'display_plugin_admin_page' )
		);
	}


	/**
	 * Renders the pages and handles the form post requests
	 *
	 * @since    1.0.0
	 */
	public function display_plugin_admin_page() {
		
		// edit an alert
		if ( isset($_GET['edit']) && !isset($_POST['edit_alert']) ) {
			global $wpdb;
			$alert_table = $wpdb->base_prefix . "jalert_alerts";
			$trigger_table = $wpdb->base_prefix . "jalert_triggers";
			$action_table = $wpdb->base_prefix . "jalert_actions";

			$alert = $wpdb->get_row('SELECT * FROM ' . $alert_table . ' WHERE id = "' .$_GET['edit'] .'"');
			if ($alert) {
				$trigger = $wpdb->get_row('SELECT * FROM ' . $trigger_table . ' WHERE id = "' . $alert->trgr_id . '"');
				$action = $wpdb->get_row('SELECT * FROM ' . $action_table . ' WHERE id = "' . $alert->action_id . '"');
				
				$trigger_options = unserialize($alert->trgr_options);
				$action_options = unserialize($alert->action_options);
								
				$trigger_field = $this->jalert_create_formfields('trigger', $trigger->options_type, $trigger->options, $trigger_options);
				$action_field = $this->jalert_create_formfields('action', $action->options_type, $action->options, $action_options);
			
				include_once('views/ja_edit_alert.php');
			}
		}
		
		// activate an alert
		if ( isset($_GET['activate']) ) {
			global $wpdb;
			$alert_table = $wpdb->base_prefix . "jalert_alerts";
			$id = $_GET['activate'];
			$wpdb->query( "UPDATE $alert_table SET deleted_at = NULL WHERE id = $id" );
		}

		if ( !isset($_GET['edit']) && empty($_POST) || isset($_POST['ifttt_options']) ) {
			
			// deactivate an alert			
			if ( isset($_GET['deactivate']) ) {
				$this->jalert_delete_alert( $_GET['deactivate'] );
			}
											
			if ( isset($_POST['ifttt_options']) ) {
			
				$options = $this->jalert_return_selected_options($_POST);
				
				$trigger_options = '';
				if (!empty($options['trigger'])) {
					$trigger_options = apply_filters('trigger_options_save', $options['trigger'], $_POST['trigger_tag']);
					$trigger_options = serialize($trigger_options);
				}
				
				$action_options = '';
				if (!empty($options['action'])) {
					$action_options = apply_filters('action_options_save', $options['action'], $_POST['action_tag']);
					$action_options = serialize($action_options);
				}
				
				$now = current_time( 'mysql' );
				
				global $wpdb;
				$alert_table = $wpdb->base_prefix . "jalert_alerts";
				
				$alert = $wpdb->insert(
					$alert_table,
					array(
						'site_id' => $wpdb->blogid,
						'trgr_id' => $_POST['trigger'],
						'action_id' => $_POST['action'],
						'trgr_options' => $trigger_options,
						'action_options' => $action_options,
						'created_at' => $now,
						'modified_at' => $now
					)
				);
			}
			
			$triggers = self::jalert_triggers();
			$actions = self::jalert_actions();
			$alerts = self::jalert_alerts();
			$dalerts = self::jalert_alerts(true);
			
			include_once( 'views/admin.php' );
		}
		
		if ( isset($_POST['new_ifttt']) ) {

			$trigger = self::jalert_get_trigger($_POST['trigger']);		
			$action = self::jalert_get_action($_POST['action']);
			
			$trigger_field = '';
			if (!empty($trigger->options)) {
				$trigger_field = $this->jalert_create_formfields('trigger', $trigger->options_type, $trigger->options);
			}
			
			$action_field = '';
			if (!empty($action->options)) {
				$action_field = $this->jalert_create_formfields('action', $action->options_type, $action->options);
			}
			
			if (empty($action_field) && empty($trigger_field)) {
				$now = current_time( 'mysql' );
				
				global $wpdb;
				$alert_table = $wpdb->base_prefix . "jalert_alerts";
				
				$alert = $wpdb->insert(
					$alert_table,
					array(
						'site_id' => $wpdb->blogid,
						'trgr_id' => $_POST['trigger'],
						'action_id' => $_POST['action'],
						'trgr_options' => '',
						'action_options' => '',
						'created_at' => $now,
						'modified_at' => $now
					)
				);
				
				$triggers = self::jalert_triggers();
				$actions = self::jalert_actions();
				$alerts = self::jalert_alerts();
				$dalerts = self::jalert_alerts(true);
				include_once( 'views/admin.php' );
				
			} else {
				include_once('views/ja_select_alert_options.php');
			}
		}
		
		if (isset($_POST['edit_alert'])) {
			// edit an alert
			$options = $this->jalert_return_selected_options($_POST);
			$trigger_options = '';
			if (!empty($options['trigger'])) {
				$trigger_options = apply_filters('trigger_options_save', $options['trigger'], $_POST['trigger_tag']);
				$trigger_options = serialize($trigger_options);
			}
			
			$action_options = '';
			if (!empty($options['action'])) {
				$action_options = apply_filters('action_options_save', $options['action'], $_POST['action_tag']);
				$action_options = serialize($action_options);
			}
			
			$now = current_time( 'mysql' );
			
			global $wpdb;
			$alert_table = $wpdb->base_prefix . "jalert_alerts";
			
			$alert = $wpdb->update(
				$alert_table,
				array(
					'trgr_options' => $trigger_options,
					'action_options' => $action_options,
					'modified_at' => $now
				),
				array(
					'id' => $_POST['alert_id']
				)
			);
			
			unset($_POST);
			$triggers = self::jalert_triggers();
			$actions = self::jalert_actions();
			$alerts = self::jalert_alerts();
			$dalerts = self::jalert_alerts(true);
			include_once( 'views/admin.php' );
						
		}
	}
	
	
	/**
	 * Add settings action link to the plugins page.
	 *
	 * @since    1.0.0
	 */
	public function add_action_links( $links ) {

		return array_merge(
			array(
				'settings' => '<a href="' . admin_url( 'options-general.php?page=' . $this->plugin_slug ) . '">' . __( 'Settings', $this->plugin_slug ) . '</a>'
			),
			$links
		);

	}

	
	/**
	 * returns the options for the trigger and action selected by the user when creating a new alert.
	 * 
	 * @access public
	 * @param mixed $post
	 * @return void
	 */
	public function jalert_return_selected_options( $post ) {
		global $wpdb;
		
		$trigger = '';
		if (!empty($post['trigger'])) {
			$trigger = self::jalert_get_trigger($post['trigger']);
		}		
		
		$action = '';
		if (!empty($post['action'])) {
			$action = self::jalert_get_action($post['action']);
		}
		
		$toption = '';
		if (!empty($trigger->options)) {
			$trigger_options = unserialize($trigger->options);
		
		
			switch ($trigger->options_type) {
				case 'select':
					foreach ($trigger_options as $k => $v) {
						if ($post['trigger-option'] == $k) {
							$toption = array($k => $k);
						}
					}
					break;
				
				case 'checkbox':
					foreach ($trigger_options as $k => $v) {
						if ($post['trigger-'.$k] == $k) {
							$toption[$k] = $k;
						}
					}
					break;
				
				case 'input':
					foreach ($trigger_options as $k => $v) {
						if ( isset($post['trigger-'.$k] ) ) {
							$toption[$k] = $post['trigger-'.$k];
						}
					}
					break;
			}
		}
		
		$aoption = '';
		if (!empty($action->options)) {
			$action_options = unserialize($action->options);
			switch ($action->options_type) {
				case 'select':
					foreach ($action_options as $k => $v) {
						if ($post['action-option'] == $k) {
							$aoption = array($k => $k);
						}
					}
					break;
				
				case 'checkbox':
					foreach ($action_options as $k => $v) {
						if ($post['action-'.$k] == $k) {
							$aoption[$k] = $k;
						}
					}
					break;
				
				case 'input':
					foreach ($action_options as $k => $v) {
						if ( isset($post['action-'.$k] ) ) {
							$aoption[$k] = $post['action-'.$k];
						}
					}
					break;
			}
		}
		
		$options = array('trigger' => $toption, 'action' => $aoption);
		
		return $options;	
	}
	
	
	/**
	 * returns all registered triggers.
	 * 
	 * @access public
	 * @static
	 * @return void
	 */
	public static function jalert_triggers() {
		global $wpdb;
		$trigger_table = $wpdb->base_prefix . "jalert_triggers";
		$triggers = $wpdb->get_results(
			"
			SELECT *
			FROM $trigger_table
			"
		);
		
		return $triggers;
	}
	
	
	/**
	 * returns all registered actions.
	 * 
	 * @access public
	 * @static
	 * @return void
	 */
	public static function jalert_actions() {
		global $wpdb;
		$action_table = $wpdb->base_prefix . "jalert_actions";
		$actions = $wpdb->get_results(
			"
			SELECT *
			FROM $action_table
			"
		);
		
		return $actions;
	} 
	
	
	/**
	 * returns all currently set alerts along with all information for each trigger and action.
	 * 
	 * @access public
	 * @static
	 * @return void
	 */
	public static function jalert_alerts( $active = null ) {
		global $wpdb;
		$alert_table = $wpdb->base_prefix . "jalert_alerts";
		$trigger_table = $wpdb->base_prefix . "jalert_triggers";
		$action_table = $wpdb->base_prefix . "jalert_actions";
		
		if ( $active == null ) {
			$deleted_at = 'AND alert.deleted_at IS NULL';
		} else {
			$deleted_at = 'AND alert.deleted_at IS NOT NULL';
		}
		
		$site_id = $wpdb->blogid;
		
		$alerts = $wpdb->get_results(
			"
			SELECT
				alert.id,
				alert.trgr_options,
				alert.action_options,
				trggr.trgr,
				trggr.descriptor trggr_descriptor,
				trggr.options_type trggr_options_type,
				trggr.options trggr_options,
				action.action,
				action.descriptor act_descriptor,
				action.options_type action_options_type,
				action.options act_options
			FROM $alert_table alert
			INNER JOIN $trigger_table trggr
				ON alert.trgr_id = trggr.id
			INNER JOIN $action_table action
				ON alert.action_id = action.id
			WHERE alert.site_id = $site_id
			$deleted_at
			ORDER BY alert.created_at DESC
			"
		);

		return $alerts;
	}
	
	
	/**
	 * retrieves a trigger by it's id.
	 * 
	 * @access public
	 * @static
	 * @param mixed $id
	 * @return void
	 */
	public static function jalert_get_trigger( $id ) {
		global $wpdb;
		$trigger_table = $wpdb->base_prefix . "jalert_triggers";
		
		$trigger = $wpdb->get_row("SELECT * FROM $trigger_table WHERE id = $id");
		
		return $trigger;
	}
	
	
	/**
	 * retrieves an action by it's id.
	 * 
	 * @access public
	 * @static
	 * @param mixed $id
	 * @return void
	 */
	public static function jalert_get_action ( $id ) {
		global $wpdb;
		$action_table = $wpdb->base_prefix . "jalert_actions";
		
		$action = $wpdb->get_row("SELECT * FROM $action_table WHERE id = $id");
		
		return $action;
	}
	
	
	/**
	 * retrieves an alert by it's id.
	 * 
	 * @access public
	 * @static
	 * @param mixed $id
	 * @return void
	 */
	public static function jalert_get_alert ( $id ) {
		global $wpdb;
		$alert_table = $wpdb->base_prefix . "jalert_alerts";
		
		$alert = $wpdb->get_row("SELECT * FROM $alert_table WHERE id = $id");
		
		return $alert;
	}
 	
	
	/**
	 * Creates the form fields for the trigger an action options.
	 * 
	 * @access public
	 * @param mixed $fieldName
	 * @param mixed $options
	 * @return void
	 */
	public function jalert_create_formfields($type, $field_type, $options, $value = null) {
		$options = unserialize($options);
		$field = '';
		
		switch ($field_type) {
			case 'select':
				$field = '<p><select name="'.$type.'-option">';
				foreach ($options as $k => $v) {
					$selected = '';
					if (!empty($value) && in_array($k, $value)) {
						$selected = 'selected="selected"';
					}
					$field .= '<option value="'.$k.'" ' . $selected . '>'.$v.'</option>';
				}
				$field .= '</select></p>';
				break;
			
			case 'checkbox':
				foreach ($options as $k => $v) {
					$checked = '';
					if (!empty($value) && in_array($k, $value)) {
						$checked = 'checked="checked"';
					}
					$field .= '<p><input type="checkbox" name="'.$type.'-'.$k.'" value="'.$k.'" ' . $checked . '>'.$v.'</p>';
				}
				break;
				
			case 'input':
				foreach ($options as $k => $v) {
					$val = '';
					if (!empty($value) && !empty($value[$k])) {
						$val = 'value="' . stripslashes($value[$k]) . '"';
					}
					$field .= '<p><input type="text" name="'.$type.'-'.$k.'" id="'.$k.'" ' . $val . '> <label for="'.$k.'">'.$v.'</label></p>';
				}
				break;
		}
		
		return $field;
	}
		
	
	/**
	 * Deletes an alert set by a user. The alert still remains in the database, a date is inserted into the deleted_at field to signify it was deleted.
	 * 
	 * @access private
	 * @param mixed $array_key
	 * @return void
	 */
	private function jalert_delete_alert( $key ) {
		global $wpdb;
		$alert_table = $wpdb->base_prefix . "jalert_alerts";
		$now = current_time( 'mysql' );
		
		$wpdb->update(
			$alert_table,
			array(
				'deleted_at' => $now
			),
			array(
				'id' => $key
			)
		);
	}
	
	
/************************
*						*
*	JETTY ALERTS API	*
*						*
************************/
	
	/**
	 * This is the main trigger API. See the plugin Readme for directions how to use the API
	 * 
	 * @access public
	 * @static
	 * @param mixed $trigger
	 * @param mixed $condition
	 * @return void
	 */
	public static function jetty_trigger_check( $trigger, $options = null ) {
		// find any triggers with $trigger name
		global $wpdb;
		$trigger_table = $wpdb->base_prefix . "jalert_triggers";
		$trgr = $wpdb->get_row("SELECT * FROM $trigger_table WHERE trgr = '$trigger'");
		
		// find any alerts with $trigger id
		if (!empty($trgr->id)) {
			$alert_table = $wpdb->base_prefix . "jalert_alerts";
			
			$alerts = $wpdb->get_results("SELECT * FROM $alert_table WHERE trgr_id = $trgr->id AND site_id = $wpdb->blogid AND deleted_at IS NULL");
			
			foreach ( $alerts as $alert ) {
			
				// check to see if the passed $options match with the user selected options
				if (!empty($alert->id)) {
					
					$result = false;
					if (!empty($alert->trgr_options)) {
						$selected_options = unserialize($alert->trgr_options);

						foreach ( $options as $option ) {
							if (in_array($option, $selected_options)) {
								$result = true;
							}
						}
					} else {
						$result = true;
					}
					
					// if there is a match do_action()
					if ($result == true) {
						$action_table = $wpdb->base_prefix . "jalert_actions";
						
						$action_options = '';
						if (!empty($alert->action_options)) {
							$action_options = unserialize($alert->action_options);
						}
						
						$action = $wpdb->get_row("SELECT * FROM $action_table WHERE id = $alert->action_id");

						do_action($action->action, $action_options);
						// todo: add alerts log
					}
				}
				
			} // end - foreach ( $alerts as $alert ) {
		}
		return $trigger;
	}
	
	
	/**
	 * API for adding a new trigger. Plugins add their triggers using - apply_filters( 'jetty_register_trigger', $trigger, $descriptor, $options_type, $options );.
	 * 
	 * @access public
	 * @static
	 * @param array $trigger
	 * @return void
	 */
	public static function jalert_register_trigger( $trigger, $descriptor, $options_type = null, $options = null, $update = null) {
		global $wpdb;
		$trigger_table = $wpdb->base_prefix . "jalert_triggers";
		
		if ($options != null) {
			$options = serialize($options);
		}
		
		// check to see if the trigger exists
		$trgr = $wpdb->get_row("SELECT * FROM $trigger_table WHERE trgr = '$trigger'");

		if ( $update == true && !empty($trgr) ) {
			$wpdb->update(
				$trigger_table,
				array(
					'descriptor' => $descriptor, 
					'options_type' => $options_type, 
					'options' => $options 
				),
				array(
					'trgr' => $trigger
				)
			);
			
			return 'Updated ' . $trigger;
			
		} else {
			
			if (empty($trgr)) {
				$wpdb->insert( 	
					$trigger_table, 
					array( 
						'trgr' => $trigger, 
						'descriptor' => $descriptor, 
						'options_type' => $options_type, 
						'options' => $options 
					)
				);
				
				return 'Added '.$trigger;
			} else {
				return 'The trigger name, ' . $trigger . ', has already been used. Please choose a different name for your trigger';
			}
		}
	}
	
		
	/**
	 * API for adding a new action. Plugins add their actions using - apply_filters( 'jetty_register_action', $trigger, $descriptor, $options_type, $options );.
	 * 
	 * @access public
	 * @static
	 * @param array $action
	 * @return void
	 */
	public static function jalert_register_action( $action, $descriptor, $options_type = null, $options = null, $update = null) {
		global $wpdb;
		$action_table = $wpdb->base_prefix . "jalert_actions";
		
		if ($options != null) {
			$options = serialize($options);
		}

		// check to see if the action exists
		$actn = $wpdb->get_row("SELECT * FROM $action_table WHERE action = '$action'");

		if ( $update == true && !empty($actn) ) {
			$wpdb->update(
				$action_table,
				array(
					'descriptor' => $descriptor, 
					'options_type' => $options_type, 
					'options' => $options 
				),
				array(
					'action' => $action
				)
			);
			
			return 'Updated ' . $action;

		} else {
			
			if (empty($actn)) {
				$wpdb->insert(
					$action_table,
					array(
						'action' => $action,
						'descriptor' => $descriptor,
						'options_type' => $options_type,
						'options' => $options
					)
				);
				
				return 'Added '.$action;
			} else {
				return 'The action name, ' . $action . ', has already been used. Please choose a different name for your action';
			}
		}
	}

}