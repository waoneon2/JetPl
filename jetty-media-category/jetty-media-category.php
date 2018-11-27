<?php
if ( ! defined( 'ABSPATH' ) ) exit;
/*
Plugin Name: Jetty Media Category
Plugin URI: http://eresources.com
Description: Allow you to add categories/tags to media and category shortcode for listing in pages/posts
Version: 0.1
Author: Jetty Team
Author URI: http://eresources.com
License: GPL version 2 or later - http://www.gnu.org/licenses/old-licenses/gpl-2.0.html
*/

function jmc_register_taxononomy_for_media() {
    $shouldRegister = get_option('jmc_setting_checkbox_custom_taxonomy', false);
    if ($shouldRegister === '') {
        $shouldRegister = false;
    }
    if (!$shouldRegister) {
        register_taxonomy_for_object_type('category', 'attachment');
        register_taxonomy_for_object_type('post_tag', 'attachment');
    } else {
        $slug = defined( 'JMC_SLUG' ) ? JMC_SLUG : 'media';
        /** Categories */
        $category_labels = array(
            'name'              => sprintf(_x( '%s Categories', 'taxonomy general name', 'jmc'), 'Media'),
            'singular_name'     => sprintf(_x( '%s Category', 'taxonomy singular name', 'jmc'), 'Media'),
            'search_items'      => sprintf(__( 'Search %s Categories', 'jmc'), 'Media' ),
            'all_items'         => sprintf(__( 'All %s Categories', 'jmc'), 'Media' ),
            'parent_item'       => sprintf(__( 'Parent %s Category', 'jmc'), 'Media' ),
            'parent_item_colon' => sprintf(__( 'Parent %s Category:', 'jmc'), 'Media' ),
            'edit_item'         => sprintf(__( 'Edit %s Category', 'jmc'), 'Media' ),
            'update_item'       => sprintf(__( 'Update %s Category', 'jmc'), 'Media' ),
            'add_new_item'      => sprintf(__( 'Add New %s Category', 'jmc'), 'Media' ),
            'new_item_name'     => sprintf(__( 'New %s Category Name', 'jmc'), 'Media' ),
            'menu_name'         => __( 'Categories', 'jmc'),
        );

        $category_args = apply_filters('jmc_media_category_args', array(
            'hierarchical' => true,
            'labels'       => apply_filters('jmc_media_category_label', $category_labels),
            'show_ui'      => true,
            'query_var'    => 'media_category',
            'rewrite'      => array('slug' => $slug . '/category', 'with_front' => false, 'hierarchical' => true )
        ));

        register_taxonomy('media_category', array('attachment'), $category_args );
        register_taxonomy_for_object_type( 'media_category', 'attachment' );

        /** Tags */
        $tag_labels = array(
            'name'                  => sprintf( _x( '%s Tags', 'taxonomy general name', 'jmc' ), 'Media' ),
            'singular_name'         => sprintf( _x( '%s Tag', 'taxonomy singular name', 'jmc' ), 'Media' ),
            'search_items'          => sprintf( __( 'Search %s Tags', 'jmc' ), 'Media' ),
            'all_items'             => sprintf( __( 'All %s Tags', 'jmc' ), 'Media' ),
            'parent_item'           => sprintf( __( 'Parent %s Tag', 'jmc' ), 'Media' ),
            'parent_item_colon'     => sprintf( __( 'Parent %s Tag:', 'jmc' ), 'Media' ),
            'edit_item'             => sprintf( __( 'Edit %s Tag', 'jmc' ), 'Media' ),
            'update_item'           => sprintf( __( 'Update %s Tag', 'jmc' ), 'Media' ),
            'add_new_item'          => sprintf( __( 'Add New %s Tag', 'jmc' ), 'Media' ),
            'new_item_name'         => sprintf( __( 'New %s Tag Name', 'jmc' ), 'Media' ),
            'menu_name'             => __( 'Tags', 'jmc' ),
            'choose_from_most_used' => sprintf( __( 'Choose from most used %s tags', 'jmc' ), 'Media' ),
        );

        $tag_args = apply_filters( 'jmc_media_tag_args', array(
                'hierarchical' => false,
                'labels'       => apply_filters( 'jmc_media_tag_label', $tag_labels ),
                'show_ui'      => true,
                'query_var'    => 'media_tag',
                'rewrite'      => array( 'slug' => $slug . '/tag', 'with_front' => false, 'hierarchical' => true  ),
            )
        );
        register_taxonomy('media_tag', array('attachment'), $tag_args);
        register_taxonomy_for_object_type( 'media_tag', 'attachment' );
    }
    flush_rewrite_rules();
}
add_action('init', 'jmc_register_taxononomy_for_media');

// Bulk action to bulk assign categories to media

function jmc_get_categories_obj(){
    $args = array(
        'type'                     => 'attachment',
        'child_of'                 => 0,
        'parent'                   => '',
        'orderby'                  => 'name',
        'order'                    => 'ASC',
        'hide_empty'               => 0,
        'hierarchical'             => 1,
        'exclude'                  => '',
        'include'                  => '',
        'number'                   => '',
        'taxonomy'                 => 'category',
        'pad_counts'               => false 
    );

    return get_categories( $args );
}
add_filter( 'bulk_actions-upload', 'jmc_custom_bulk_action' );

function buildTree(array $elements, $parentId = 0, $level = 0, $number = 0) {
    $branch = array();

    $level++;
    $number++;
  
    foreach ($elements as $key => $element) {
        if ($element->category_parent == $parentId) {
            
            $children = buildTree($elements, $element->cat_ID, $level, $number);
            $element->number = $number;

            $nbsp = '';
            for ($i=0; $i < $level; $i++) { 
                $nbsp .= '&nbsp;&nbsp;&nbsp;';    
            }
            $element->nbsp = $nbsp;

            if ($children) {
                $element->level = $level;
                $element->has_child = 1;
                $element->children = $children;
            }
            $branch[] = $element;
        }
    }

    return $branch;
}

function getOrderData($datas, $parentid = 0)
{
    $array = [];
    foreach ($datas as $val) {
        $indata = array(
            "cat_ID" => $val["cat_ID"], 
            "name" => $val["name"], 
            "nbsp" => $val["nbsp"], 
            "category_parent" => $parentid);
        $array[] = $indata;
        if (isset($val["children"])) {
            $children = getOrderData($val["children"], $val["cat_ID"]);
            if ($children) {
                $array = array_merge($array, $children);
            }
        }
    }
    return $array;
}

function jmc_custom_bulk_action($bulk_action){
    $break = 0;
    $categories = jmc_get_categories_obj();
    $bulk_action[-1] = __('Categories','jmc');

    $treeArr= buildTree($categories);
    $result = json_decode(json_encode($treeArr), true);
    $result = getOrderData($result);

    foreach ($result as $key1 => $value1) {
        $bulk_action['add_'.$value1['cat_ID']] = __($value1['nbsp'].'Add: '.$value1['name'],'jmc');
    }
    foreach ($result as $key2 => $value2) {
        $bulk_action['remove_'.$value2['cat_ID']] = __($value2['nbsp'].'Remove: '.$value2['name'],'jmc');
    }
    $bulk_action['deleteall_404'] = __('&nbsp;&nbsp;&nbsp;Delete all','jmc');

    return $bulk_action;
}

add_filter( 'handle_bulk_actions-upload', 'jmc_custom_bulk_action_handler', 10, 3 );

function jmc_custom_bulk_action_handler($redirect_to, $action_name, $post_ids){
    $da = explode("_", $action_name);
    $categories = jmc_get_categories_obj();
    $arr_cat_id = wp_list_pluck($categories, 'cat_ID');

    if(isset($post_ids)){
        if($da[0] === "add"){
            for ($i=0; $i < count($post_ids); $i++) {
                $set_cat_to_media = wp_set_post_categories( (int)$post_ids[$i], array($da[1]), true );
            }
        }
        if($da[0] === "remove"){
            for ($i=0; $i < count($post_ids); $i++) {
                $remove_cat_on_media = wp_remove_object_terms( (int)$post_ids[$i], (int)$da[1], 'category' );
            }
        }
        if($da[0] === "deleteall"){
            for ($i=0; $i < count($post_ids); $i++) {
                $remove_cat_on_media_all = wp_remove_object_terms( (int)$post_ids[$i], $arr_cat_id, 'category' );
            }
        }
        return $redirect_to;
    } else {
        return $redirect_to;
    }
    return $redirect_to;
}
// --- EOF ---

// Filter category for Media
add_action('pre_get_posts', 'jmc_filter_media_by_cat');
add_action( 'restrict_manage_posts', 'jmc_add_media_cat_dropdown' );

function jmc_filter_media_by_cat( $setcol ) {
    if(function_exists('get_current_screen')):
        $screen = get_current_screen();
        $cat = filter_input(INPUT_GET, 'postcat', FILTER_SANITIZE_STRING );   
        if ( ! $setcol->is_main_query() || ! is_admin() || (int)$cat <= 0 || $screen->base !== 'upload' )
          return;

        $args = array(
            'cat' => (int)$cat,
            'post_type' => array('attachment'),
            'post_status' => array('inherit','publish')
        );

        $jmc_query = new WP_Query( $args );
        $jmc_cat_id_arr = ( ! empty( $jmc_query->posts ) ) ? wp_list_pluck($jmc_query->posts, 'ID') : false;

        if(!empty($jmc_cat_id_arr)){
            $setcol->set( 'post__in', $jmc_cat_id_arr );
        } else {
            $setcol->set( 'p', -1 );
        }
      
        wp_reset_postdata();
    endif;
}

function jmc_add_media_cat_dropdown() {
    if(function_exists('get_current_screen')):
        $screen = get_current_screen();
        if ( $screen->base !== 'upload' ) return;
        $cat = filter_input(INPUT_GET, 'postcat', FILTER_SANITIZE_STRING );  
        $selected = (int)$cat > 0 ? $cat : '-1';  
        $args = array(
            'show_option_none'   => 'View all categories',
            'name'               => 'postcat',
            'hide_empty'         => 0,
            'child_of'           => 0,
            'orderby'            => 'name',
            'taxonomy'           => 'category',
            'selected'           => $selected
        ); 
        wp_dropdown_categories( $args );
    endif;
}
// EOF Filter category for Media

function JMCFileSizeConvert($bytes)
{
    $bytes = floatval($bytes);
        $arBytes = array(
            0 => array(
                "UNIT" => "TB",
                "VALUE" => pow(1024, 4)
            ),
            1 => array(
                "UNIT" => "GB",
                "VALUE" => pow(1024, 3)
            ),
            2 => array(
                "UNIT" => "MB",
                "VALUE" => pow(1024, 2)
            ),
            3 => array(
                "UNIT" => "KB",
                "VALUE" => 1024
            ),
            4 => array(
                "UNIT" => "B",
                "VALUE" => 1
            ),
        );

    foreach($arBytes as $arItem)
    {
        if($bytes >= $arItem["VALUE"])
        {
            $result = $bytes / $arItem["VALUE"];
            $result = str_replace(".", "," , strval(round($result, 2)))." ".$arItem["UNIT"];
            break;
        }
    }
    return $result;
}

function jmc_count_number_post($wp_query, $total_of_number = false){
    $paged    = max( 1, $wp_query->get( 'paged' ) );
    $per_page = $wp_query->get( 'posts_per_page' );
    $total    = $wp_query->found_posts;
    $first    = ( $per_page * $paged ) - $per_page + 1;
    $last     = min( $total, $wp_query->get( 'posts_per_page' ) * $paged );
    $pagination_content = '';

    if ( 1 == $total ) {
        $pagination_content .= '<div class="jmc-row jmc-shortcode-count"><div class="jmc-col-md-12"><p class="doctype-showing">Showing '.$first.'&ndash;'.$last.' of '.$total.' </p></div></div>';
    } elseif ( $total <= $per_page || -1 == $per_page ) {
        $pagination_content .= '<div class="jmc-row jmc-shortcode-count"><div class="jmc-col-md-12"><p class="doctype-showing">Showing '.$first.'&ndash;'.$last.' of '.$total.' </p></div></div>';
    } else {
        if($total_of_number && $per_page <= $total){
            $t_o_n = $wp_query->get( 'posts_per_page' );
            $pagination_content .= '<div class="jmc-row jmc-shortcode-count"><div class="jmc-col-md-12"><p class="doctype-showing">Showing '.$first.'&ndash;'.$last.' of '.$t_o_n.' </p></div></div>';
        }
        else {
            $pagination_content .= '<div class="jmc-row jmc-shortcode-count"><div class="jmc-col-md-12"><p class="doctype-showing">Showing '.$first.'&ndash;'.$last.' of '.$total.' </p></div></div>';
        }
    }


    return $pagination_content;
}

function jmc_pagination($wp_query, $paged) {

    $big = 999999999;

    $html_pagination = "";
    if (is_single()) {
        $paginate_links = paginate_links( array(
            'base'    => get_permalink() . '%#%',
            'format'  => '?paged=%#%',
            'current' => max( 1, $paged ),
            'total'   => $wp_query->max_num_pages,
        ) );
    } else {
        $big = 999999;
        $search_for   = array( $big, '#038;' );
        $replace_with = array( '%#%', '&' );
        $paginate_links = paginate_links( array(
            'base'    => str_replace( $search_for, $replace_with, get_pagenum_link( $big ) ),
            'format'  => '?paged=%#%',
            'current' => max( 1, $paged),
            'total' => $wp_query->max_num_pages,
            'mid_size' => 5,
            'prev_next' => true,
            'prev_text' => __( 'prev', 'jmc' ),
            'next_text' => __( 'next', 'jmc' ),
            'type' => 'plain',
        ) );
    }

    if ( $paginate_links ) {
        $html_pagination .= '<div class="jmc-row jmc-shortcode-pagination"><div class="jmc-col-md-12">';
        $html_pagination .= '<div class="pagination-centered">';
        $html_pagination .= $paginate_links;
        $html_pagination .= '</div><!--// end .pagination -->';
        $html_pagination .= '</div></div>';
    }

    return $html_pagination;
}

function jmc_get_custom_excerpt($count){
    $excerpt = get_the_content();
    $excerpt = strip_tags($excerpt);
    $excerpt = substr($excerpt, 0, $count);
    return $excerpt;
  }

// [media-listing category=category_id] or [media-listing tag=tag_id]
function jmc_register_shorcode($atts) {
    $atts = shortcode_atts(array(
        'category' => 0,
        'tag' => 0,
        'category_slugs' => '',
        'tag_slugs' => '',
        'posts_per_page' => -1,
        'post_status' => array('inherit','publish'),
        'display_date'    => 'true',
        'orderby'          => 'post_date',
        'order'            => 'DESC',
        'pagination'       => 'true',
        'number'           => 9,
        'featured'         => false,
        'private'          => false,
        'slider'           => '',
        'exclude_tag'      => ''
    ), $atts, 'media-listing');
    $custom = get_option('jmc_setting_checkbox_custom_taxonomy', false);
    if ($custom === '') {
        $custom = false;
    }

    $query = array(
        'post_type' => array('attachment','post'),
        'post_status' => array('inherit', 'publish'),
        'orderby'        => $atts['orderby'],
        'order'          => $atts['order']
    );

    if (filter_var($atts['pagination'], FILTER_VALIDATE_BOOLEAN) ||
            (! filter_var($atts['pagination'], FILTER_VALIDATE_BOOLEAN) && $atts[ 'number' ])) {
        $query['posts_per_page'] = (int) $atts['number'];

        if ( $query['posts_per_page'] < 0 ) {
            $query['posts_per_page'] = abs( $query['posts_per_page'] );
        }
    } else {
        $query['nopaging'] = true;
    }

    $featured = false;

    if (filter_var($atts['featured'], FILTER_VALIDATE_BOOLEAN)) {
        $query['post_type'] = array('post');
        $query['order'] = 'DESC';
        $featured = true;
    }
    if (filter_var($atts['private'], FILTER_VALIDATE_BOOLEAN)) {
        $query['post_status'] = array_merge($query['post_status'], ['private']);
    }
    $paged = 1;
    //pagination
    if ( get_query_var( 'paged' ) )
        $paged = $query['paged'] = get_query_var('paged');
    else if ( get_query_var( 'page' ) )
        $paged = $query['paged'] = get_query_var( 'page' );
    else
        $paged = $query['paged'] = 1;

    $tax_query = array('relation' => 'AND');
    if ($atts['category'] !== 0) {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_category' : 'category',
            'field' => 'term_id',
            'terms' => explode(',', (string) $atts['category'])
        );
    } else if ($atts['category_slugs'] !== '') {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_category' : 'category',
            'field' => 'slug',
            'terms' => explode(',', (string) $atts['category_slugs'])
        );
    }

    if ($atts['tag'] !== 0) {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_tag' : 'post_tag',
            'field'    => 'term_id',
            'terms'    => explode(',', (string) $atts['tag'])
        );
    } else if ($atts['tag_slugs'] !== '') {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_tag' : 'post_tag',
            'field'    => 'slug',
            'terms'    => explode(',', (string) $atts['tag_slugs'])
        );
    }

    if(isset($atts['exclude_tag']) && !empty($atts['exclude_tag'])){
        $tax_query[] = array(
            'taxonomy' => 'post_tag',
            'field'    => 'slug',
            'terms'    => explode(',', (string) $atts['exclude_tag']),
            'operator' => 'NOT IN',
        );
    }

    $query['tax_query'] = $tax_query;
    $wp_query = null;
    $wp_query = new WP_Query($query);

    return $featured ?  jetty_media_category_featured_html($wp_query, $atts, $paged)
    : /** otherwise */  jetty_media_category_print_html($wp_query, $atts, $paged);
}
add_shortcode('media-listing', 'jmc_register_shorcode');

function jetty_media_category_featured_html($wp_query, $atts = array(), $paged = 1) {
    global $post;
    $html = "";
    $content_list = "";
    // tag for first loop
    $first = true;
    $asset = plugin_dir_url(__FILE__) . 'img/';
    if ($wp_query->have_posts()) {
        while ($wp_query->have_posts()) {
            $wp_query->the_post();

            $content_list .= '<div class="jmc-col-md-12 clearfix">';
            $content_list .= '<div class="doc-list-full-item clearfix">';
            $content_list .= '<div class="jmc-col-md-12 jmc-col-sm-12 title-wrap">';
            if(filter_var($atts['display_date'], FILTER_VALIDATE_BOOLEAN)) {
                $content_list .= '<small>'.get_the_date('F j, Y').'</small>';
            }
            $lock = '';
            if ($post->post_status === 'private') {
                $lock .= '<div class="locked-info"><img src="' . esc_url($asset . 'lock.png') .'"></div>';
            }
            // title
            $content_list .= '<h3>';
            if ($post->post_status === 'private' && is_user_logged_in()) {
                $can_view_post = current_user_can('edit_post', $post->ID);
                if ($can_view_post) {
                    $content_list .= '<a href="'.esc_url(get_permalink()).'">'._jai_get_the_title() . $lock .'</a>';
                } else {
                    $content_list .= _jai_get_the_title() . $lock;
                }
            } else if ($post->post_status === 'private' && !is_user_logged_in()) {
                $content_list .= _jai_get_the_title() . $lock;
            } else {
                $content_list .= '<a href="'.esc_url(get_permalink()).'">'._jai_get_the_title() . $lock .'</a>';
            }
            $content_list .= '</h3>';
            $content_list .= '</div><!-- eof .jmc-jmc-col-md-12.jmc-jmc-col-sm-12.title-wrap -->';

            if ($first && $paged === 1 && $post->post_status !== 'private') {
                $content_list .= '<div class="jmc-col-md-12 jmc-col-sm-12">';
                $content_list .= get_the_post_thumbnail();
                $content_list .= '</div><!-- eof .jmc-jmc-col-md-12.jmc-jmc-col-sm-12 -->';
                $content_list .= '<div class="jmc-col-md-12 jmc-col-sm-12">';
                // we need to detach do shortcode in the_content here, otherwise
                // we will hit infinite loop if the content also contains our shortcode
                remove_shortcode('media-listing');
                $content_list .= apply_filters('the_content', get_the_content());
                add_shortcode('media-listing', 'jmc_register_shorcode');
                $content_list .= '</div><!-- eof .jmc-jmc-col-md-12.jmc-jmc-col-sm-12 -->';
            }
            $content_list .= '</div><!-- eof .doc-list-full-item -->';
            $content_list .= '</div><!-- eof .jmc-jmc-col-md-12 -->';
            $first = false;
        }
        wp_reset_postdata();
        if (filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
            $html .= jmc_count_number_post($wp_query);
            $html .= '<div class="jmc-row jmc-shortcode-content-list">';
            $html .= $content_list;
            $html .= '</div><!-- eof .jmc-row -->';
        endif;
        if (filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
            $html .= jmc_pagination($wp_query, $paged);
        endif;
        if(!filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
            $html .= jmc_count_number_post($wp_query, true);
            $html .= '<div class="jmc-row jmc-shortcode-content-list">';
            $html .= $content_list;
            $html .= '</div><!-- eof .jmc-row -->';
        endif;
    }
    return $html;
}

function jetty_media_category_print_html($wp_query, $atts = array(), $paged = 1) {
    global $post;
    $html = "";
    $content_list = "";
    $asset_url    = plugin_dir_url( __FILE__ ) . "img/";
    $file_img_pdf = $asset_url . "pdf_lrg.gif";
    $content_file_img_url = "";
    $type_doc = array('pdf','psd','ai','eps','ps','doc','rtf','xls','ppt');
    $width = "";
    $height = "";
    $link_href = "";
    $content_slider = "";


    if ( $wp_query->have_posts() ) {
        while ( $wp_query->have_posts() ) {
            $wp_query->the_post();
            $post_type  = $post->post_type;
            $file_url   = wp_get_attachment_url( get_the_ID() );
            $filetype   = wp_check_filetype( $file_url );

            if(isset($atts['slider']) && !empty($atts['slider'])){
                $content_slider .= '<div class="container_slider">';
                if($post_type !== 'post'){
                    $width = '300';
                    $height = '300';
                    $content_slider .= '<div class="content_img_attachment">';
                        $content_slider .= '<a href="'.esc_url( get_the_permalink(get_the_ID()) ).'" title="'.get_the_title(get_the_ID()).'" rel="bookmark">';
                            $content_slider .= '<img width="'.$width.'" height="'.$height.'" src="'.wp_get_attachment_url( get_the_ID() ).'" class="img-media" alt="'.get_the_title(get_the_ID()).'">';
                        $content_slider .= '</a>';
                    $content_slider .= '</div>';
                    

                    $content_slider .= '<div class="content_title">';
                    $content_slider .= '<h2 class="entry-title post-title">';
                        $content_slider .= '<a href="'.esc_url( get_the_permalink(get_the_ID()) ).'" title="'.get_the_title(get_the_ID()).'" rel="bookmark">';
                            $content_slider .= get_the_title(get_the_ID());
                        $content_slider .= '</a>';
                    $content_slider .= '</h2>';
                    $content_slider .= '</div>';
                } else {
                    if ( has_post_thumbnail() ) {
                        $content_slider .= '<div class="content_featured_img">';
                            $content_slider .= '<a href="'.esc_url( get_the_permalink(get_the_ID()) ).'" title="'.get_the_title(get_the_ID()).'" rel="bookmark">';
                                $content_slider .= get_the_post_thumbnail(get_the_ID(), 'large');
                            $content_slider .= '</a>';
                        $content_slider .= '</div>';
                    }
                    $content_slider .= '<div class="content_title">';
                        $content_slider .= '<h2 class="entry-title post-title">';
                            $content_slider .= '<a href="'.esc_url( get_the_permalink(get_the_ID()) ).'" title="'.get_the_title(get_the_ID()).'" rel="bookmark">';
                                $content_slider .= get_the_title(get_the_ID());
                            $content_slider .= '</a>';
                        $content_slider .= '</h2>';
                    $content_slider .= '</div>';
        
                    $content_slider .= '<div class="content_post">';
                        if (filter_var($atts['slider'], FILTER_VALIDATE_INT)) {
                            $content_slider .= jmc_get_custom_excerpt((int) $atts['slider']);
                        } else {
                            switch ($atts['slider']) {
                                case 'full':
                                    $content_slider .= get_the_content();
                                    break;

                                case 'excerpt':
                                    $content_slider .= get_the_excerpt(get_the_ID());
                                    break;
                                
                                default:
                                    $content_slider .= get_the_content();
                                    break;
                            }
                        }
                        
                    $content_slider .= '</div>';
                }
                $content_slider .= '</div>';
            } else {
                if(in_array($filetype['ext'], $type_doc)){
                    $content_file_img_url = $file_img_pdf;
                    $width = "24";
                    $height = "24";
                    $link_href = wp_get_attachment_url( get_the_ID() );
                } else {
                    $content_file_img_url = wp_get_attachment_url( get_the_ID() );
                    $link_href = get_permalink();
                    $width = "auto";
                    $height = "auto";
                }
                $content_list .= '<div class="jmc-col-md-12 clearfix">';
                $content_list .= '<div class="doc-list-full-item clearfix">';
                $content_list .= '<div class="jmc-col-md-11 jmc-col-sm-11">';
                if(filter_var($atts['display_date'], FILTER_VALIDATE_BOOLEAN)):
                    $content_list .= '<small>'.get_the_date('F j, Y').'</small>';
                endif;
                $content_list .= '<h3' . ($post->post_status === 'private' ? ' class="jmc-title-post-private"' : '') . '>';
                $lock = '';
                if ($post->post_status === 'private') {
                    $lock .= '<div class="locked-info"><img src="' . esc_url($asset_url . 'lock.png') .'"></div>';
                }
                if ($post->post_status === 'private' && is_user_logged_in()) {
                    $can_view_post = current_user_can('edit_post', $post->ID);
                    if ($can_view_post) {
                        $content_list .= '<a href="'.esc_url(get_permalink()).'">'._jai_get_the_title() . $lock .'</a>';
                    } else {
                        $content_list .= _jai_get_the_title() . $lock;
                    }
                } else if ($post->post_status === 'private' && !is_user_logged_in()) {
                    $content_list .= _jai_get_the_title() . $lock;
                } else {
                    $content_list .= '<a href="'.esc_url(get_permalink()).'">'._jai_get_the_title() . $lock .'</a>';
                }
    
                if($post_type !== 'post'):
                    $content_list .= '&nbsp;<small>('.JMCFileSizeConvert(filesize( get_attached_file( get_the_ID() ) )).')</small>';
                endif;
    
                $content_list .= '</h3>';
                
                $content_list .= '</div><!-- eof .jmc-jmc-col-md-11.jmc-jmc-col-sm-11 -->';
    
                if($post_type !== 'post'):
                $content_list .= '<div class="jmc-col-md-1 jmc-col-sm-1">';
                $content_list .= '<a href="'.$link_href.'"><img width="'.$width.'" height="'.$height.'" src="'.$content_file_img_url.'" class="jmc-img-responsive jmc-img-thumbnail" alt="'._jai_get_the_title().'"></a>';
                $content_list .= '</div><!-- eof .jmc-jmc-col-md-1 jmc-col-sm-1 -->';
                endif;
    
                $content_list .= '</div><!-- eof .doc-list-full-item -->';
                $content_list .= '</div><!-- eof .jmc-jmc-col-md-12 -->';
            }
        }
        wp_reset_postdata();
        if(isset($atts['slider']) && !empty($atts['slider'])){
            $html .= '<div class="content-slider cycle-slideshow" data-cycle-slides="> div" data-cycle-fx=fadeout data-cycle-timeout=5000 data-cycle-pause-on-hover=true data-cycle-auto-height=calc data-cycle-prev=".jmcPrevControl" data-cycle-next=".jmcNextControl" data-cycle-log=false>';
                $html .= $content_slider;
            $html .= '</div>';

            $class_count = ($wp_query->post_count <= 1) ? 'hide_nextprev' : '';
            $html .= '<!-- prev/next links -->';
            $html .= '<div class="jmc_prev_next_center '.$class_count.'">';
                $html .= '<span class="jmcPrevControl">Prev </span>';
                $html .= '<span class="jmcNextControl"> Next</span>';
            $html .= '</div>';
        } else {
            if (filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
                $html .= jmc_count_number_post($wp_query);
                $html .= '<div class="jmc-row jmc-shortcode-content-list">';
                $html .= $content_list;
                $html .= '</div><!-- eof .jmc-row -->';
            endif;
            if (filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
                $html .= jmc_pagination($wp_query, $paged);
            endif;
            if(!filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
                $html .= jmc_count_number_post($wp_query, true);
                $html .= '<div class="jmc-row jmc-shortcode-content-list">';
                $html .= $content_list;
                $html .= '</div><!-- eof .jmc-row -->';
            endif;
        }
    }
    else { return ''; }
    return $html;
}

add_filter( 'query_vars', 'jmc_query_vars' );

// Video Listing
add_shortcode('video-listing', 'jmc_register_video_shortcode');

function jmc_register_video_shortcode($atts)
{
    global $post;
    $assetIMG = plugin_dir_url(__FILE__) . 'img/';
    $atts = shortcode_atts([
        'category'          => 0,
        'tag'               => 0,
        'category_slugs'    => '',
        'tag_slugs'         => '',
        'posts_per_page'    => -1,
        'post_status'       => ['inherit','publish'],
        'display_date'      => 'true',
        'orderby'           => 'post_date',
        'order'             => 'DESC',
        'pagination'        => 'true',
        'number'            => 8,
        'layout'            => 'horizontal',
        'show_excerpt'      => false,
        'columns'           => 4
    ], $atts, 'video-listing');

    $custom = get_option('jmc_setting_checkbox_custom_taxonomy', false);
    if ($custom === '') {
        $custom = false;
    }

    $query = array(
        'post_type'      => array('attachment','post'),
        'post_status'    => array('inherit', 'publish'),
        'orderby'        => $atts['orderby'],
        'order'          => $atts['order']
    );

    if (filter_var($atts['pagination'], FILTER_VALIDATE_BOOLEAN) ||
            (! filter_var($atts['pagination'], FILTER_VALIDATE_BOOLEAN) && $atts[ 'number' ])) {
        $query['posts_per_page'] = (int) $atts['number'];

        if ( $query['posts_per_page'] < 0 ) {
            $query['posts_per_page'] = abs( $query['posts_per_page'] );
        }
    } else {
        $query['nopaging'] = true;
    }

    $paged = 1;
    //pagination
    if ( get_query_var( 'paged' ) )
        $paged = $query['paged'] = get_query_var('paged');
    else if ( get_query_var( 'page' ) )
        $paged = $query['paged'] = get_query_var( 'page' );
    else
        $paged = $query['paged'] = 1;

    $tax_query = array('relation' => 'AND');
    if ($atts['category'] !== 0) {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_category' : 'category',
            'field' => 'term_id',
            'terms' => explode(',', (string) $atts['category'])
        );
    } else if ($atts['category_slugs'] !== '') {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_category' : 'category',
            'field' => 'slug',
            'terms' => explode(',', (string) $atts['category_slugs'])
        );
    }

    if ($atts['tag'] !== 0) {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_tag' : 'post_tag',
            'field'    => 'term_id',
            'terms'    => explode(',', (string) $atts['tag'])
        );
    } else if ($atts['tag_slugs'] !== '') {
        $tax_query[] = array(
            'taxonomy' => $custom ? 'media_tag' : 'post_tag',
            'field'    => 'slug',
            'terms'    => explode(',', (string) $atts['tag_slugs'])
        );
    }

    $query['tax_query'] = $tax_query;

    $wp_query = new WP_Query($query);
    $horizontal = $atts['layout'] === 'horizontal';
    $html = '';
    $content_list_horizontal = '';
    $content_list_vertical   = '';

    if ($wp_query->have_posts()):
        $loop = 1;
        $columns = $atts['columns'];
        while ($wp_query->have_posts()): $wp_query->the_post();
            $classes = ['jmc-video-item'];
            if ( 0 === ( $loop - 1 ) % $columns || 1 === $columns ) {
                $classes[] = 'first';
            }
            if ( 0 === $loop % $columns ) {
                $classes[] = 'last';
            }

            // Horizontal
            $content_list_horizontal .= '<div class="jmc-col-md-3">';
            $content_list_horizontal .= '<div class="video-listing" id="horizontal-layout">';

                if(has_post_thumbnail()){
                    $featured_img_url = get_the_post_thumbnail_url(get_the_ID(),'large');

                    $content_list_horizontal .= '<div class="img content">';
                        $content_list_horizontal .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
                    $content_list_horizontal .= '</div><!-- .img.content -->';
                } else {
                    $featured_img_url = $assetIMG . 'noimage.png';

                    $content_list_horizontal .= '<div class="img content">';
                        $content_list_horizontal .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
                    $content_list_horizontal .= '</div><!-- .img.content -->';
                }

                $content_list_horizontal .= '<div class="title-wrap">';
                    $content_list_horizontal .= '<h3 class="jmc-on-title">';
                        $content_list_horizontal .= '<a class="jmc-title-link" href="'.esc_url(get_permalink()).'" rel="bookmark">'.get_the_title().'</a>';
                    $content_list_horizontal .= '</h3><!-- .jmc-on-title -->';
                    if(filter_var($atts['display_date'], FILTER_VALIDATE_BOOLEAN)) {
                        $content_list_horizontal .= '<small>'.get_the_date('F j, Y').'</small>';
                    }
                $content_list_horizontal .= '</div><!-- .title-wrap -->';

                $content_list_horizontal .= '<div class="content-excerpt-wrap">';
                    if (filter_var($atts['show_excerpt'], FILTER_VALIDATE_BOOLEAN)) {
                        $content_list_horizontal .= get_the_excerpt();
                    }
                $content_list_horizontal .= '</div><!-- .content-excerpt-wrap -->';

            $content_list_horizontal .= '</div><!-- .jmc-jmc-col-md-3 -->';
            $content_list_horizontal .= '</div><!-- .video-listing -->';
            // eof Horizontal

            // Vertical
            $content_list_vertical .= '<div class="jmc-col-md-4" id="on-img">';
                if(has_post_thumbnail()){
                    $featured_img_url = get_the_post_thumbnail_url(get_the_ID(),'large');

                    $content_list_vertical .= '<div class="content-img">';
                        $content_list_vertical .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img-vertical" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
                    $content_list_vertical .= '</div><!-- .content-img -->';
                } else {
                    $featured_img_url = $assetIMG . 'noimage.png';

                    $content_list_vertical .= '<div class="content-img">';
                        $content_list_vertical .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img-vertical" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
                    $content_list_vertical .= '</div><!-- .content-img -->';
                }
            $content_list_vertical .= '</div><!-- #on-img -->';

            $content_list_vertical .= '<div class="jmc-col-md-8" id="on-content">';
                if(filter_var($atts['display_date'], FILTER_VALIDATE_BOOLEAN)) {
                    $content_list_vertical .= '<small>'.get_the_date('F j, Y').'</small>';
                }
                $content_list_vertical .= '<h3 class="jmc-on-title">';
                    $content_list_vertical .= '<a class="jmc-title-link" href="'.esc_url(get_permalink()).'" rel="bookmark">'.get_the_title().'</a>';
                $content_list_vertical .= '</h3><!-- .jmc-on-title -->';

                $content_list_vertical .= '<div class="content-excerpt-wrap">';
                if (filter_var($atts['show_excerpt'], FILTER_VALIDATE_BOOLEAN)) {
                    $content_list_vertical .= get_the_excerpt();
                }
                $content_list_vertical .= '</div><!-- .content-excerpt-wrap -->';

            $content_list_vertical .= '</div><!-- #on-content -->';
            $content_list_vertical .= '<hr>';
            // eof Vertical

        $loop++;
        endwhile;
        wp_reset_postdata();

        if (filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
            $html .= jmc_count_number_post($wp_query);
            if($horizontal == "horizontal"){
                $html .= '<div class="jmc-row jmc-shortcode-content-list">';
                $html .= $content_list_horizontal;
                $html .= '</div><!-- eof .jmc-row -->';
            } else {
                $html .= '<div class="jmc-row jmc-shortcode-content-list" id="vertical-layout">';
                $html .= $content_list_vertical;
                $html .= '</div><!-- eof .jmc-row -->';
            }
        endif;

        if (filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
            $html .= jmc_pagination($wp_query, $paged);
        endif;

        if(!filter_var( $atts['pagination'], FILTER_VALIDATE_BOOLEAN )):
            $html .= jmc_count_number_post($wp_query, true);
            if($horizontal == "horizontal"){
                $html .= '<div class="jmc-row jmc-shortcode-content-list">';
                $html .= $content_list_horizontal;
                $html .= '</div><!-- eof .jmc-row -->';
            } else {
                $html .= '<div class="jmc-row jmc-shortcode-content-list" id="vertical-layout">';
                $html .= $content_list_vertical;
                $html .= '</div><!-- eof .jmc-row -->';
            }
        endif;
    else:
        $html .= __('No posts found', 'jmc');
    endif;

    return $html;
}

function jmc_query_vars( $query_vars ){
    $query_vars[] = 'page';
    return $query_vars;
}

function jmc_settings_api_init() {
    add_settings_section(
        'jmc_setting_section_media_taxo',
        __('Media Category', 'jmc'),
        'jmc_setting_section_media_taxo',
        'media'
    );

    add_settings_field(
        'jmc_setting_checkbox_custom_taxonomy',
        'Use custom taxonomy',
        'jmc_setting_checkbox_custom_taxonomy',
        'media',
        'jmc_setting_section_media_taxo'
    );

    register_setting('media', 'jmc_setting_checkbox_custom_taxonomy');
}

add_action('admin_init', 'jmc_settings_api_init');

function jmc_setting_section_media_taxo() {
    echo '<p>' . __('Choose to use post\'s categories and tags for media attachment or use custom taxonomy') . '</p>';
}

function jmc_setting_checkbox_custom_taxonomy() {
    $set = get_option('jmc_setting_checkbox_custom_taxonomy', false);
    echo '<label for="jmc_setting_checkbox_custom_taxonomy">' . "\n";
        echo '<input id="jmc_setting_checkbox_custom_taxonomy" name="jmc_setting_checkbox_custom_taxonomy" type="checkbox" value="1"' . checked(esc_attr($set), '1', false) . ' />' . "\n";
    echo '</label>' . "\n";
}

function jmc_add_custom_categories($fields, $post) {
    $custom = get_option('jmc_setting_checkbox_custom_taxonomy', false);
    if($custom):
        $categories = get_categories(array('taxonomy' => 'media_category', 'hide_empty' => 0));
        $post_categories = wp_get_object_terms($post->ID, 'media_category', array('fields' => 'ids'));
    else:
        $categories = get_categories(array('hide_empty' => 0));
        $post_categories = wp_get_object_terms($post->ID, 'category', array('fields' => 'ids'));
    endif;

    $all_cats = "";
    $all_cats .= '<ul id="media-categories-list" style="width:100%;">';
    $i = 0;

    foreach ($categories as $category) {
        if (in_array($category->term_id, $post_categories)) {
            $checked = ' checked="checked"';
        } else {
            $checked = '';
        }
        $option = '<li style="width:auto;"><input type="checkbox" value="'.$category->term_id.'" class="media-category-checkbox" id="'.$post->ID.'-'.$category->slug.'" name="attachments['.$post->ID.'][all_categories]['.$i.']"'.$checked.'> ';
        $option .= '<label for="'.$post->ID.'-'.$category->category_nicename.'">'.$category->cat_name.'</label>';
        $option .= '</li>';
        $all_cats .= $option;
        $i++;
    }

    $all_cats .= '</ul>';

    $fields['all_categories'] = array(
        'label' => __('Categories'),
        'input' => 'html',
        'html' => $all_cats
    );

    return $fields;
}
add_filter('attachment_fields_to_edit', 'jmc_add_custom_categories', 10, 2);

function jmc_add_categories_handle_save($post, $attachments) {
    $custom = get_option('jmc_setting_checkbox_custom_taxonomy', false);
    $taxo = $custom ? 'media_category' : 'category';
    $terms = array_values(isset($attachments['all_categories']) ? $attachments['all_categories'] : []);
    $terms = array_map('intval', array_unique($terms));
    if ($taxo === 'category') {
        $post['post_category'] = count($terms) === 0 ? null : $terms;
    } else {
        $post['tax_input'] = [
            'media_category' => count($terms) === 0 ? null : $terms
        ];
    }
    return $post;
}
add_filter('attachment_fields_to_save', 'jmc_add_categories_handle_save', 10, 2);

function jmc_style_of_media(){
    wp_enqueue_style('jmc-admin-media', plugins_url( 'admin_media.css', __FILE__ ), [], '0.0.1');
    $screen = get_current_screen();
    if ( $screen->base === 'upload' ) {
        wp_enqueue_script( 'jmc-admin-script', plugins_url('/js/jmc-admin-script.js', __FILE__ ), array('jquery'), '20171123', true );
    }

    if( $screen->base === 'widgets') {
        wp_enqueue_script( 'jmc-tippy-script', plugins_url('/inc/tippyjs/tippy.all.js', __FILE__ ), array('jquery'), '20180322', true );
        wp_enqueue_script( 'jmc-admin-little-script', plugins_url('/js/jmc-admin-little-script.js', __FILE__ ), array('jquery'), '20180322', true );
    }
    
}
add_action('admin_enqueue_scripts', 'jmc_style_of_media');

function jmc_style_frontented() {
    wp_enqueue_style( 'dashicons' );
    wp_enqueue_style('jmc-frontend', plugins_url('jetty-media-category.css', __FILE__ ), [], '0.0.1');

    wp_enqueue_script( 'jmc-cycle2-script', plugins_url('/inc/cycle2/jquery.cycle2.min.js', __FILE__ ), array('jquery'), '20141007', true );
    wp_enqueue_script( 'jmc-cycle2-carousel-script', plugins_url('/inc/cycle2/jquery.cycle2.carousel.min.js', __FILE__ ), array('jquery'), '20141007', true );
    wp_enqueue_script( 'jmc-cycle2-caption2-script', plugins_url('/inc/cycle2/jquery.cycle2.caption2.js', __FILE__ ), array('jquery'), '20141007', true );
    wp_enqueue_script( 'jmc-cycle2-center-script', plugins_url('/inc/cycle2/jquery.cycle2.center.js', __FILE__ ), array('jquery'), '20141007', true );
        
    wp_enqueue_script( 'jmc-script', plugins_url('/js/jmc-script.js', __FILE__ ), array('jquery'), '20170819', true );
}
add_action('wp_enqueue_scripts', 'jmc_style_frontented', 60);

function jai_startsWith($needles, $str) {
    foreach ((array) $needles as $needle) {
        if ($needle != '' && strpos($str, $needle) === 0) {
            return true;
        }
    }
    return false;
}

function _jai_get_the_title() {
    $title = get_the_title();
    if (jai_startsWith('Private: ', $title)) {
        return substr($title, 9);
    }
    return $title;
}

// register the widget
function _jmc_register_widgets_media() {
    require __DIR__ . '/class-jetty-media-category-widget-media.php';
    register_widget('JettyMediaCategoryWidgetMedia');
}

add_action('widgets_init', '_jmc_register_widgets_media');


function jmc_tinymce_button(){
    if ( !current_user_can( 'edit_posts' ) && !current_user_can( 'edit_pages' ) ) {
        return;
    }

    if ( 'true' == get_user_option( 'rich_editing' ) ) {
        add_filter( 'mce_external_plugins', 'jmc_tinymce_plugin' );
        add_filter( 'mce_buttons', 'jmc_register_tinymce_button' );
  }
}
add_action( 'admin_head', 'jmc_tinymce_button' );

function jmc_tinymce_plugin( $plugin_array ) {
  $plugin_array['jmc_tinymce_button'] = plugins_url('/js/jmc-tinymce-editor-plugin.js',__FILE__);
  return $plugin_array;
}
function jmc_register_tinymce_button( $buttons ) {
  array_push( $buttons, 'jmc_tinymce_button' );
  return $buttons;
}