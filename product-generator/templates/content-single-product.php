<?php

if (!defined('ABSPATH')) exit;

do_action('prgen_before_single_product');
if (post_password_required()) {
    echo get_the_password_form();
    return;
}

?>
<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
    <div class="prgen">
        <?php do_action('prgen_before_single_product_summary'); ?>
        <div class="summary entry-summary">
            <?php do_action( 'prgen_single_product_summary'); ?>
        </div>
        <?php do_action( 'prgen_after_single_product_summary'); ?>
    </div>
</article>

<?php do_action( 'prgen_after_single_product' ); ?>