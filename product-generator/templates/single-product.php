<?php
if (!defined('ABSPATH')) exit;

get_header('product-generator');

do_action('prgen_before_main_content');

// the loop
while (have_posts()): the_post();
    prgen_get_template_part('content', 'single-product');
endwhile;

do_action('prgen_after_main_content');

do_action('prgen_sidebar');

get_footer('product-generator');