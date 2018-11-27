<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<?php do_action( 'prgen_before_my_account' ); ?>

<?php prgen_get_template('myaccount/my-configurations.php', ['configs' => $configs ]); ?>

<?php do_action( 'prgen_after_my_account' ); ?>