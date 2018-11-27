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
<h2>Alert Options</h2>
<div class="wrap">
	<form method="post">
		<input type="hidden" name="trigger" value="<?php echo $trigger->id; ?>">
		<input type="hidden" name="trigger_tag" value="<?php echo $trigger->trgr; ?>">
		
		<?php if ( !empty( $trigger_field ) ) : ?>
			<p>Options for trigger: <strong><?php echo $trigger->descriptor; ?></strong></p>
			<?php echo $trigger_field; ?>		
		<?php endif; ?>
		
		<input type="hidden" name="action" value="<?php echo $action->id; ?>">
		<input type="hidden" name="action_tag" value="<?php echo $action->action; ?>">
		<?php if ( !empty( $action_field ) ) :?>
			<p>Options for action: <strong><?php echo $action->descriptor; ?></strong></p>
			<?php echo $action_field; ?>
		<?php endif; ?>
		
		<input type="submit" class="button-primary" name="ifttt_options" value="Submit">
	</form>
</div>