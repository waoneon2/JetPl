<?php
/**
 * Represents the view for the administration dashboard.
 *
 * This includes the header, options, and other information that should provide
 * The User Interface to the end user.
 *
 * @package   Jetty Alerts
 * @author    Chad Baron <chad@jettyapp.com>
 * @license   GPL-2.0+
 * @link      http://jettyapp.com
 * @copyright 2014 Jetty
 */
?>

<div class="wrap">

	<h2><?php echo esc_html( get_admin_page_title() ); ?></h2>

	<p>Jetty Alerts are based on the IFTTT (If This Then That) model.</p>
	
	<h3>How it works</h3>
	<p>There are multiple triggers built in to Jetty. The triggers are based on events that happen inside Jetty. When the event occurs it triggers an action. Also within Jetty are multiple actions.</p>
	<p>The triggers and actions are put together in a sort of recipe. Here is an example: if an email is received from the president (trigger) send notification to the CEO (action).</p>

	<hr>

	<h3>Create an Alert</h3>
	
	<?php if ( !empty($triggers) && !empty($actions) ): ?>
		<form method="post">
		<p>If this happens...
		<select name="trigger">
		<?php foreach ( $triggers as $trigger ): ?>
			<option value="<?php echo $trigger->id; ?>"><?php echo $trigger->descriptor; ?></option>
		<?php endforeach; ?>
		</select>
		
		 then do this...
		<select name="action">
		<?php foreach ( $actions as $action ): ?>
			<option value="<?php echo $action->id; ?>"><?php echo $action->descriptor; ?></option>
		<?php endforeach; ?>
		</select>
		</p>
		<p>
		<input type="submit" class="button-primary" name="new_ifttt" value="Submit" />	
		</p>
		</form>
	<?php else: ?>
		<p>There are no triggers or actions available.</p>
	<?php endif; ?>
	
	<hr>
	<br><br>
	<h2>Active Alerts</h2>
	<table class="widefat">
	<thead>
	<tr>
		<th>Trigger</th>
		<th>Trigger Options</th>
		<th>Action</th>
		<th>Action Options</th>
		<th></th>
	</tr>
	</thead>
	<tbody>
	<?php 
	if (!empty($alerts)) :
		foreach ( $alerts as $a ) :
			$trggr_options = unserialize($a->trggr_options); // all options
			$trgr_options = unserialize($a->trgr_options); // selected options
			$act_options = unserialize($a->act_options); // all options
			$action_options = unserialize($a->action_options); // selected options
		?>
		<tr>
			<td><?php echo $a->trggr_descriptor; ?></td>
			<td><?php 
				if (!empty($trggr_options)) {
					foreach ($trggr_options as $k1 => $v1) {
						foreach ($trgr_options as $k2 => $v2) {
							if ($k1 == $k2) {
								if ($a->trggr_options_type == 'input') {
									if (!empty($v2)) {
										echo stripslashes($v2) . '<br>';
									}
								} else {
									echo stripslashes($v1) . '<br>';
								}
							}
						}
					}
				}			
			?></td>
			<td><?php echo $a->act_descriptor; ?></td>
			<td><?php
				if (!empty($act_options)) { 
					foreach ($act_options as $k3 => $v3) {
						foreach ($action_options as $k4 => $v4) {
							if ($k3 == $k4) {
								if ($a->action_options_type == 'input') {
									if (!empty($v4)) {
										echo stripslashes($v4) . '<br>';
									}
								} else {
									echo stripslashes($v3) . '<br>';
								}
							}
						}
					}
				}
			
			?></td>
			<td>
				<a class="button-primary" href="?page=jetty-alerts&edit=<?php echo $a->id; ?>">Edit</a>
				<a class="button-primary" href="?page=jetty-alerts&deactivate=<?php echo $a->id; ?>">Deactivate</a>
			</td>
		</tr>
		<?php 
			unset($trggr_options); // all options
			unset($trgr_options); // selected options
			unset($act_options); // all options
			unset($action_options); // selected options
			unset($a);
		endforeach; 
	else :
	?>
		<tr>
			<td>There are no alerts currently set</td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
		</tr>
	<?php endif; ?>
	</tbody>
	</table>
	
	
	
	<?php if (!empty($dalerts)) : ?>
	<br><br><br>
	<h2>Deactivated Alerts</h2>
	<table class="widefat">
	<thead>
	<tr>
		<th>Trigger</th>
		<th>Trigger Options</th>
		<th>Action</th>
		<th>Action Options</th>
		<th></th>
	</tr>
	</thead>
	<tbody>
	
		<?php foreach ( $dalerts as $a ) :
			$trggr_options = unserialize($a->trggr_options); // all options
			$trgr_options = unserialize($a->trgr_options); // selected options
			$act_options = unserialize($a->act_options); // all options
			$action_options = unserialize($a->action_options); // selected options
		?>
		<tr>
			<td><?php echo $a->trggr_descriptor; ?></td>
			<td><?php 
				if (!empty($trggr_options)) {
					foreach ($trggr_options as $k1 => $v1) {
						foreach ($trgr_options as $k2 => $v2) {
							if ($k1 == $k2) {
								if ($a->trggr_options_type == 'input') {
									if (!empty($v2)) {
										echo stripslashes($v2) . '<br>';
									}
								} else {
									echo stripslashes($v1) . '<br>';
								}
							}
						}
					}
				}			
			?></td>
			<td><?php echo $a->act_descriptor; ?></td>
			<td><?php
				if (!empty($act_options)) { 
					foreach ($act_options as $k3 => $v3) {
						foreach ($action_options as $k4 => $v4) {
							if ($k3 == $k4) {
								if ($a->action_options_type == 'input') {
									if (!empty($v4)) {
										echo stripslashes($v4) . '<br>';
									}
								} else {
									echo stripslashes($v3) . '<br>';
								}
							}
						}
					}
				}
			
			?></td>
			<td>
				<a class="button-primary" href="?page=jetty-alerts&activate=<?php echo $a->id; ?>">Activate</a>
			</td>
		</tr>
	<?php 
		endforeach; 
	endif; 
	?>
	</tbody>
	</table>
	
	
<?php
/*
global $wp_actions;
echo '<pre>';
print_r($wp_actions);
echo '</pre>';
*/
// apply_filters( 'jetty_register_trigger', 'something_happened', 'Something Happened', 'select', array('option1' => 'Option One', 'option2' => 'Option Two', 'option3' => 'Option Three') );
// apply_filters( 'jetty_register_action', 'do_something', 'Do Something', 'select', array('option4' => 'Option Four', 'option5' => 'Option Five', 'option6' => 'Option Six') );
 
/*
 apply_filters( 'jetty_register_trigger', 'no_option_trigger', 'No Option Trigger' );
 apply_filters( 'jetty_register_action', 'no_option_action', 'No Option Action' );
*/
?>
	
	
</div>