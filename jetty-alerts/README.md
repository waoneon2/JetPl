# === Jetty Alerts ===

Jetty Alerts follows the "If this, then that (IFTTT)" model for setting and sending alerts in Jetty. 

## Description

The Jetty Alerts plugin does not handle any actual logic, it only marries triggers with actions. Individual plugins are responsible for creating the triggers that are available within the software as well as the actions that are availble to be triggered. When trigger is met within a plugin the Jetty Alerts plugin will be notified. Jetty Alerts then checks to see if any alerts have been set by the users for that particular trigger. If so, and if it meets any additional criteria, it then signals the action to run.

## Jetty Alerts API

**For triggers include in your function:**

	do_action( 'jetty_trigger', $trigger, $options );

The $trigger is the name of your trigger that you registered in Jetty Alerts. See the setup section for more details. The $options is an optional serialized array (must be a serialized array) passed to Jetty Alerts. These are the options for the trigger the user set when creating the alert. Jetty Alerts compares what is passed in the options array to what the user set. If there is a match the alert is sent by running the action.

The values in the array you pass to jetty_trigger are what will be compared to the user input. For example, say you have a trigger called user_status with three options: user added, user removed, user updated. When you registered the trigger in Jetty Alerts you passed in the options array as:a 
	
	$options = array('user_added' => 'User Added, 'user_removed' => 'User Removed', 'user_updated' => 'User Updated'). 

The key of the array is what will be used programatically to identify the option while the value is the description of the option presented to the users. When the user sets up an alert they will choose one of these options for the alert. Let's say they set up an alert to be notified when a user is removed. When any of these things happen in your plugin you will send the trigger to Jetty Alerts using the do_action above. If you are sending the user removed option you will create your options array like this: $options = array('user_removed'), and then serialize($options). 

If the parameters for the alert are met then Jetty Alerts runs the action. This is done through the do_action function:

	do_action( $your_action_tag, $options );

**For Jetty Alerts to trigger an action**

When registering your action in Jetty Alerts you defined any user selectable options. Whatever the user chose will be passed in the options array. In your plugin you must create the action as follows:

	add_action( $your_action_tag, array('Class', 'function'), 100, 1 );
	
* $your_action_tag - This is the $action you set when registering the action with Jetty Alerts. See below for more details.
* $options - When registering your action you set options that the user can choose from or text fields to accept user input. Whatever the user has input or chosen will be passed to your function as a serialized array. The array is formatted with the array key being the same as the key you set for the option when registering the action with Jetty Alerts. The value is the key for the option the user choose or in the case of a text input it is whatever the user input. In the case of a select list or checkbox the key and the value will be the same.
	
### Register triggers and actions

**To register a trigger with Jetty Alerts you will create a filter:**
	
	apply_filters( 'jetty_register_trigger', $trigger, $descriptor, $options_type, $options );
	
* $trigger - This is the name of your trigger. It should be unique, lowercase, words separated by an underscore, no spaces. This is only used programatically and not seen by the end user.
* $descriptor - This is a plain english description of what this trigger does. It should be short and clear.
* $options_type - This specifies the type of form field that will be used to collect the user input. There are only three options: select, checkbox, or input.
* $options - This is an array of options the user can choose from. IT MUST BE AN ARRAY even if there is only one option. The array should be formatted with a meaninful key and the value a plain description of what the option is for. For example: 
	
	$options = array('user_added' => 'User Added, 'user_removed' => 'User Removed', 'user_updated' => 'User Updated').

**To register an action with Jetty Alerts you will create a filter:**

	apply_filters( 'jetty_register_action', $action, $descriptor, $options_type, $options );

The parameters you pass are nearly the same as a trigger:
* $action - This is the name of your action. It should be unique, lowercase, words separated by an underscore, no spaces. This is only used programatically and not seen by the end user.
* $descriptor - This is a plain english description of what this action does. It should be short and clear.
* $options_type - This specifies the type of form field that will be used to collect the user input. There are only three options: select, checkbox, or input.
* $options - This is an array of options the user can choose from. IT MUST BE AN ARRAY even if there is only one option. The array should be formatted with a meaninful key and the value a plain description of what the option is for. For example, if the action is to send an email and you want the user to enter an email address to which to send to your array may look like this:


	$options = array( 'to_email' => 'Enter the email address to be notified');