<?php
/**
 * Select options for chosen alert setup
 *
 *
 * @package   Jetty Alerts
 * @author    Chad Baron <chad@jettyapp.com>
 * @license   GPL-2.0+
 * @link      http://jettyapp.com
 * @copyright 2014 Jetty
 */
?>
<h2>Edit Alert</h2>
<div class="wrap">
	<form method="post" action="?page=jetty-alerts">
		<input type="hidden" name="trigger" value="<?php echo $alert->trgr_id; ?>">
		<input type="hidden" name="trigger_tag" value="<?php echo $trigger->trgr; ?>">

		<?php if ( !empty( $trigger_field ) ) : ?>
			<p>Options for trigger: <strong><?php echo $trigger->descriptor; ?></strong></p>
			<?php echo $trigger_field; ?>		
		<?php endif; ?>
		
		<input type="hidden" name="action" value="<?php echo $alert->action_id; ?>">
		<input type="hidden" name="action_tag" value="<?php echo $action->action; ?>">
		<?php if ( !empty( $action_field ) ) :?>
			<p>Options for action: <strong><?php echo $action->descriptor; ?></strong></p>
			<?php echo $action_field; ?>
		<?php endif; ?>
		
		<input type="hidden" name="alert_id" value="<?php echo $alert->id; ?>">
		
		<input type="submit" class="button-primary" name="edit_alert" value="Submit">
	</form>
</div>