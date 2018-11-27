<?php
/**
 * Content wrappers
 */
if (!defined('ABSPATH')) exit;

$theme = get_option('template');
switch ( $theme ) {
    case 'twentyeleven' :
        echo '<div id="primary" class="prgen-primary"><div id="content" role="main" class="twentyeleven prgenapp">';
        break;
    case 'twentytwelve' :
        echo '<div id="primary" class="site-content prgen-primary"><div id="content" role="main" class="twentytwelve" prgenapp>';
        break;
    case 'twentythirteen' :
        echo '<div id="primary" class="site-content prgen-primary"><div id="content" role="main" class="entry-content twentythirteen prgenapp">';
        break;
    case 'twentyfourteen' :
        echo '<div id="primary" class="content-area prgen-primary"><div id="content" role="main" class="site-content twentyfourteen"><div class="tfwc prgenapp">';
        break;
    case 'twentyfifteen' :
        echo '<div id="primary" role="main" class="content-area twentyfifteen prgen-primary"><div id="main" class="site-main t15wc prgenapp">';
        break;
    case 'twentysixteen' :
        echo '<div id="primary" class="content-area twentysixteen prgen-primary"><main id="main" class="site-main prgenapp" role="main">';
        break;
    default :
        echo '<div id="container"><div id="content" role="main" class="prgenapp">';
        break;
}
