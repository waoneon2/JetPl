<?php
/**
 * Admin
 */

require __DIR__ . '/admin-functions.php';

//add subscriber capability
function add_subscriber_caps() {
    $role = get_role( 'subscriber' );
    $role->add_cap( 'edit_others_pages' );
}
add_action( 'admin_init', 'add_subscriber_caps');


function prgen_admin_enqueue_scripts()
{
    $screen       = get_current_screen();

    wp_register_script('mithril', PRGEN_PLUGIN_DIR_URL . 'assets/js/lib/mithril.js', [], '2.0');
    if (in_array($screen->id, ['prgen-products-conf'])) {
        // Add the color picker css file
        wp_enqueue_style( 'wp-color-picker' );
        // Include our custom jQuery file with WordPress Color Picker dependency
        wp_register_script('modal-js', PRGEN_PLUGIN_DIR_URL . 'assets/js/lib/bootstrap.js', array('jquery'), '');
        wp_enqueue_style('modal-css', PRGEN_PLUGIN_DIR_URL . 'assets/css/bootstrap.min.css');
        wp_enqueue_style('style-default', PRGEN_PLUGIN_DIR_URL . 'assets/css/admin-css.css');
        wp_enqueue_script('prgen-admin-js', PRGEN_PLUGIN_DIR_URL . 'assets/js/admin-scripts.js', array(
            'jquery',
            'modal-js',
            'mithril'
        ), '0.0.1');
        wp_enqueue_script( 'prgen-custom', PRGEN_PLUGIN_DIR_URL . 'assets/js/admin-custom.js', array( 'wp-color-picker' ), false, true );

        wp_localize_script('prgen-admin-js', 'prgenAdminParams', array(
            'wp_ajax_url'                  => admin_url('admin-ajax.php'),
            'save_product_option_nonce'    => wp_create_nonce('prgen_admin_save_option_nonce'),
            'delete_product_option_nonce'  => wp_create_nonce('prgen_admin_delete_option_nonce'),
            'sort_options_nonce'           => wp_create_nonce('prgen_admin_sort_options')
        ));
    }

    if (taxonomy_exists('prgen-product-series')) {
        wp_enqueue_media();
    }
}
add_action('admin_enqueue_scripts', 'prgen_admin_enqueue_scripts');

function prgen_add_meta_boxes()
{
    // Product's metaboxes
    add_meta_box('prgen_option', __('Option', 'prgen'), 'prgen_option_meta_box', 'prgen-products-conf', 'normal', 'default');
    add_meta_box( 'prgen_repeatable_fields', __('Steps', 'prgen'), 'prgen_repeatable_fields_meta_box', 'prgen-products-conf', 'normal', 'default');

    // Configuration
    add_meta_box('prgen_product_series', __('Product Series', 'prgen'), 'prgen_admin_product_series_meta_box', 'prgen-configuration', 'normal', 'default');
    add_meta_box('prgen_product_id', __('Product', 'prgen'), 'prgen_admin_product_id_meta_box', 'prgen-configuration', 'normal', 'default');
    add_meta_box('prgen_parts', __('Option Parts', 'prgen'), 'prgen_admin_parts_meta_box', 'prgen-configuration', 'normal', 'default');
    add_meta_box('prgen_configuration_edit', __('Edit', 'prgen'), 'prgen_admin_configuration_edit_meta_box', 'prgen-configuration', 'side', 'low');
}
add_action('add_meta_boxes', 'prgen_add_meta_boxes');

function prgen_option_meta_box($post)
{
    $meta = get_post_meta($post->ID);
    $partNumber = isset($meta['prgen_part_number']) ? $meta['prgen_part_number'][0] : '';
    $disclaimer = isset($meta['prgen_disclaimers']) ? $meta['prgen_disclaimers'][0] : '';
    ?>
    <table class="form-table">
        <tbody>
            <tr class="option-item">
                <th><label for="prgen_part_number"><?php echo esc_attr(__( 'Part Number', 'prgen')); ?></th>
                <td><input type="text" name="prgen_part_number" id="prgen_part_number" value="<?php echo esc_attr($partNumber); ?>" class="widefat" /></td>
            </tr>

            <tr class="options-item">
                <th><label for="prgen_disclaimers"><?php echo esc_attr(__( 'Disclaimer', 'prgen')); ?></th>
                <td><textarea id="prgen_disclaimers" rows="10" cols="70" name="prgen_disclaimers" ><?php echo $disclaimer; ?></textarea></td>
            </tr>
        </tbody>
    </table>
    <?php
    wp_nonce_field( basename( __FILE__ ), 'prgen_product_meta_box_nonce' );
}

function prgen_repeatable_fields_meta_box($post)
{
    $childs = prgen_get_product_childs($post->ID);
    $preload = json_encode(['preload' => array_values(array_map('prgen_admin_map_product_option_js', $childs))]);
     ?>
    <div class="prgen-metaboxes-wrapper">
    </div>
    <script type="text/javascript">
        var prgenOptionsPreload = <?php echo $preload; ?>;
    </script>
    <?php
}

function prgen_product_meta_box_save($postid, $post)
{
    // echo "<pre> -1- <br/>";
    // print_r(count($_POST['prgen_top_op'], 1)); 
    // print_r($_POST); exit();
    if (!isset($_POST['prgen_product_meta_box_nonce']) || !wp_verify_nonce($_POST['prgen_product_meta_box_nonce'], basename(__FILE__))) {
        return;
    }

    if ((defined( 'DOING_AUTOSAVE') && DOING_AUTOSAVE)
        || (defined('DOING_AJAX') && DOING_AJAX)
        || (defined('DOING_CRON') && DOING_CRON)
        || isset($_REQUEST['bulk_edit'])) {
        return;
    }

    if (isset($post->post_type) && 'revision' == $post->post_type ) {
        return;
    }

    prgen_db_transaction(function ($wpdb) use ($postid, $post) {
        $fields = [
            'prgen_disclaimer',
            'prgen_product_type',
            'prgen_part_number',
            'prgen_disclaimers'
        ];

        foreach ($fields as $field) {
            $value = isset($_POST[$field]) ? $_POST[$field] : '';
            if ($value) {
                //  save/update
                update_post_meta($post->ID, $field, $value);
            } else {
                //  delete if blank
                delete_post_meta($post->ID, $field);
            }
        }

        // now insert the childs
        _prgen_admin_save_post_product_option($post->ID, $_POST['prgen_top_op']);
        foreach ($_POST['prgen_top_op']['op'] as $key => $value) {
            _prgen_admin_save_post_product_option($key, $value);
        }

    });
}
add_action('save_post', 'prgen_product_meta_box_save', 10, 2);

function _prgen_admin_save_post_product_option($parent, $posted)
{
    $i = 0;
    remove_action('save_post', 'prgen_product_meta_box_save', 10, 2);
    foreach ($posted['ID'] as $key => $ID) {
        $params = [
            'ID'            => $ID,
            'parent'        => $parent,
            'author'        => $_POST['post_author'],
            'post_title'    => $posted['name'][$i],
            'post_content'  => $posted['desc'][$i],
            'post_parent'   => $parent,
            'menu_order'    => $i,
            'part_number'   => $posted['part_number'][$i],
            'multiple'      => isset($posted['multiple']) &&  isset($posted['multiple'][$i]) ? $posted['multiple'][$i] : 0,
            'force'         => isset($posted['force']) &&  isset($posted['force'][$i]) ? $posted['force'][$i] : 0,
            'require'       => isset($posted['require']) &&  isset($posted['require'][$i]) ? $posted['require'][$i] : 0,
            'color'         => isset($posted['color']) &&  isset($posted['color'][$i]) ? $posted['color'][$i] : '',
            'disclaimers'   => $posted['disclaimer'][$i],
            'thumbnail'     => $posted['img'][$i] ? $posted['img'][$i] : '',
            'logic_display' => isset($posted['logic_display']) && isset($posted['logic_display'][$i]) ? $posted['logic_display'][$i] : 'hide',
            'logic_type'    => isset($posted['logic_type']) && isset($posted['logic_type'][$i]) ? $posted['logic_type'][$i] : 'any',
            'logic_rules'   => isset($posted['logic_rules']) && isset($posted['logic_rules'][$i]) ? $posted['logic_rules'][$i] : '',
            'img_note'   => isset($posted['img_note']) && isset($posted['img_note'][$i]) ? $posted['img_note'][$i] : '',
            'side_note'   => isset($posted['side_note']) && isset($posted['side_note'][$i]) ? $posted['side_note'][$i] : '',
        ];
        prgen_insert_product_option($params);
        $i++;
    }
    add_action('save_post', 'prgen_product_meta_box_save', 10, 2);
}

function prgen_parse_query_admin_pages($query) {
    if (defined('DOING_AJAX')) return $query;
    global $wp_query;

    if(is_admin() && is_customize_preview() && !function_exists('get_current_screen')){
        $query->set('post_parent', 0 );
    }

    if(is_admin() && function_exists('get_current_screen')) {
        $screen = get_current_screen();

        if ($screen->id === 'edit-prgen-products-conf' && $wp_query->query['post_type'] == 'prgen-products-conf') {
            $query->set('post_parent', 0 );
        }
    }


    //order by date
    if ($wp_query->query['post_type'] == 'prgen-configuration') {
        $query->set( 'orderby', 'date' );
        $query->set( 'order', 'DESC' );
    }

    return $query;
}
add_filter('parse_query', 'prgen_parse_query_admin_pages');

function prgen_filter_view_product_table($view) {
    global $wpdb, $locked_post_status, $avail_post_stati;
    $exclude_states   = get_post_stati(['show_in_admin_all_list' => false]);

    $screen       = get_current_screen();

    $user_post_count = intval($wpdb->get_var($wpdb->prepare( "
            SELECT COUNT( 1 )
            FROM $wpdb->posts
            WHERE post_type = %s
            AND post_parent = 0
            AND post_status NOT IN ( '" . implode( "','", $exclude_states ) . "' )
            AND post_author = %d
        ", 'prgen-products-conf', get_current_user_id())));

    $post_type = $screen->post_type;

    if (!empty($locked_post_status) )
        return [];

    $status_links = [];
    $num_posts = prgen_post_count_exclude_childs($post_type, 'readable');
    $total_posts = array_sum((array) $num_posts);
    $class = '';

    $current_user_id = get_current_user_id();
    $all_args = array('post_type' => $post_type);
    $mine = '';

    // Subtract post types that are not included in the admin all list.
    foreach (get_post_stati(array( 'show_in_admin_all_list' => false)) as $state ) {
        $total_posts -= $num_posts->$state;
    }

    if ($user_post_count && $user_post_count !== $total_posts) {
        if (isset($_GET['author']) && ($_GET['author'] == $current_user_id)) {
            $class = 'current';
        }

        $mine_args = [
            'post_type' => $post_type,
            'author'    => $current_user_id
        ];

        $mine_inner_html = sprintf(
            _nx(
                'Mine <span class="count">(%s)</span>',
                'Mine <span class="count">(%s)</span>',
                $user_post_count,
                'posts'
            ),
            number_format_i18n( $user_post_count )
        );

        $mine = _prgen_get_edit_link($mine_args, $mine_inner_html, $class);

        $all_args['all_posts'] = 1;
        $class = '';
    }

    if (empty($class) || isset($_REQUEST['all_posts'] )) {
        $class = 'current';
    }

    $all_inner_html = sprintf(
        _nx(
            'All <span class="count">(%s)</span>',
            'All <span class="count">(%s)</span>',
            $total_posts,
            'posts'
        ),
        number_format_i18n($total_posts)
    );

    $status_links['all'] = _prgen_get_edit_link($all_args, $all_inner_html, $class);
    if ( $mine ) {
        $status_links['mine'] = $mine;
    }

    foreach (get_post_stati(array('show_in_admin_status_list' => true), 'objects') as $status ) {
        $class = '';

        $status_name = $status->name;

        if (!in_array($status_name, $avail_post_stati) || empty($num_posts->$status_name)) {
            continue;
        }

        if (isset($_REQUEST['post_status']) && $status_name === $_REQUEST['post_status']) {
            $class = 'current';
        }

        $status_args = [
            'post_status' => $status_name,
            'post_type' => $post_type,
        ];

        $status_label = sprintf(
            translate_nooped_plural($status->label_count, $num_posts->$status_name),
            number_format_i18n($num_posts->$status_name)
        );

        $status_links[ $status_name ] = _prgen_get_edit_link($status_args, $status_label, $class);
    }

    return $status_links;
}
add_filter('views_edit-prgen-products-conf', 'prgen_filter_view_product_table');

function prgen_admin_parts_meta_box()
{
    global $post;
    $prgen_parts = esc_attr(get_post_meta($post->ID, 'prgen_parts', true));
    $parts = explode(',', $prgen_parts);


    $option_data = get_posts( array(
        'post__in'        => $parts,
        'post_type'       => 'prgen-products-conf',
        'post_status'     => 'publish',
        'orderby'          => 'menu_order',
        'order'            => 'ASC',
        'posts_per_page'   => -1,
    ) );

    echo '<div style="margin-top:10px;">
        <input name="prgen_parts" type="hidden" id="prgen_parts" value="' . $prgen_parts . '" readonly style="max-width:500px; width:100%;"/>
    </div>'; ?>

    <?php if ($option_data): ?>
    <table class="striped widefat">
        <thead style="background-color:#eee">
            <th width="80px">&nbsp;</th>
            <th><?php _e('Option Title', 'prgen'); ?></th>
            <th><?php _e('Part Number', 'prgen'); ?></th>
            <th><?php _e('Description', 'prgen'); ?></th>
            <th><?php _e('Disclaimer', 'prgen'); ?></th>
        </thead>
        <tbody>

        <?php

        $choosed_option = get_post_meta( $post->ID, 'prgen_frontend_state', true);
        $choosed_option = $choosed_option->choosed;
        $option_data = array_filter($choosed_option,function($item) use($parts) {
            return in_array($item->id, $parts);
        });

        foreach ($option_data as $key => $value) {
                if(!$value->imageUrlFull) {
                  $value->imageUrlFull = PRGEN_PLUGIN_DIR_URL . '/assets/img/rectangle.png';
                  $value->imageId  = PRGEN_PLUGIN_DIR_URL . '/assets/img/rectangle.png';
                }

            if ($key > 0): ?>
                <tr>
                    <td><img src="<?php echo $value->imageUrlFull ?>" style="width: 50px;"/></td>
                    <td><?php echo $value->title ?></td>
                    <td><?php echo $value->partNumber ?></td>
                    <td><?php echo $value->description ?></td>
                    <td><?php echo $value->disclaimer ?></td>
                </tr>
            <?php endif ?>

        <?php } ?>
        </tbody>
    </table>
    <?php endif ?>
    <?php
}

function prgen_admin_product_series_meta_box() {
    global $post;
    $prgen_series = esc_attr(get_post_meta($post->ID, 'prgen_series', true));
    $term = get_term_by('slug', $prgen_series, 'prgen-product-series');

    $thumbnail_id = absint(get_term_meta( $term->term_id, 'thumbnail_id', true ));
    $image = $default_images = PRGEN_PLUGIN_DIR_URL . 'assets/images/placeholder.png';
    if ( $thumbnail_id ) {
        $image = wp_get_attachment_thumb_url( $thumbnail_id );
    }

    /*echo '<div style="margin-top:10px;">
        <input name="prgen_product_id" type="hidden" id="prgen_product_id" value="' . $product_id . '" readonly  style="max-width:500px; width:100%;"/>
    </div>';*/ ?>
    <table class="striped widefat">
    <?php if ($term): ?>
        <thead style="background-color:#eee">
            <th width="80px">&nbsp;</th>
            <th>Product Series</th>
        </thead>
        <tbody>
        <tr>
            <td><img src="<?php echo $image ?>" style="width: 50px;"/></td>
            <td><?php echo $term->name; ?></td>
        </tr>
        </tbody>
    <?php else: ?>
        <thead style="background-color:#e3e3e3">
            <th>No Product Series</th>
        </thead>
    <?php endif ?>
    </table>
    <?php
}

function prgen_admin_product_id_meta_box()
{
    global $post;
    $product_id = esc_attr(get_post_meta($post->ID, 'prgen_product_id', true));

    $product_data = get_post($product_id);
    if ($product_data) {
        $product_meta['disclaimer']     = get_post_meta($product_data->ID, 'prgen_disclaimers', true);
        $product_meta['desc']           = $product_data->post_content;
        $product_meta['part_number']    = get_post_meta($product_data->ID, 'prgen_part_number', true);
        $product_meta['image_full']     = wp_get_attachment_image_src(get_post_thumbnail_id($product_data->ID), 'full');
        $product_meta['image']          = wp_get_attachment_image_src(get_post_thumbnail_id($product_data->ID), 'thumbnail');
    }

    echo '<div style="margin-top:10px;">
        <input name="prgen_product_id" type="hidden" id="prgen_product_id" value="' . $product_id . '" readonly  style="max-width:500px; width:100%;"/>
    </div>'; ?>
    <table class="striped widefat">
    <?php if ($product_data): ?>
        <thead style="background-color:#eee">
            <th width="80px">&nbsp;</th>
            <th>Product Titlexxx</th>
            <th>Part Number</th>
            <th>Description</th>
            <th>Disclaimer</th>
        </thead>
        <tbody>
        <tr>
            <td><img src="<?php echo $product_meta['image'][0] ?>" style="width: 50px;"/></td>
            <td><?php echo $product_data->post_title; ?></td>
            <td><?php echo $product_meta['part_number'] ?></td>
            <td><?php echo $product_meta['desc'] ?></td>
            <td><?php echo $product_meta['disclaimer'] ?></td>
        </tr>
        </tbody>
    <?php else: ?>
        <thead style="background-color:#e3e3e3">
            <th>No Product</th>
        </thead>
    <?php endif ?>
    </table>
    <?php
}

function prgen_admin_configuration_edit_meta_box()
{
    global $post;
    $prgen_product_id = esc_attr(get_post_meta($post->ID, 'prgen_product_id', true));
    $prgen_parts      = esc_attr(get_post_meta($post->ID, 'prgen_parts', true));
    $edit_link        = '#';
    $duplicate_link   = '#';
    if ($prgen_product_id) {
        $edit_link      = add_query_arg([
            'config' => $post->ID
        ], get_permalink($prgen_product_id));

        $duplicate_link = add_query_arg([
            'config' => $post->ID,
            'action' => 'prgen_duplicate_configuration'
        ], admin_url('edit.php?post_type=prgen-configuration'));

        $duplicate_link = wp_nonce_url($duplicate_link, 'prgen-duplicate-configuration_' . $post->ID);
        //$duplicate_link     = site_url() . '/wp-admin/edit.php?post_type=prgen-configuration&duplicate='.$post->ID.'&dn='.esc_attr($post->post_title);
    }
    echo '<div style="margin-top:10px;"><ul>
        <li>
            <a href="' . $edit_link . '" class="button button-primary button-large"  target="_blank">Edit</a>
        </li>
        <li>
            <a href="' . $duplicate_link . '" class="button button-large">Duplicate</a>
        </li>
    </ul></div>';
}

add_action('admin_action_prgen_duplicate_configuration', 'prgen_admin_duplicate_configuration');
function prgen_admin_duplicate_configuration() {
    check_admin_referer('prgen-duplicate-configuration_' . $_GET['config']);
    $id = $_GET['config'];
    $di = prgen_duplicate_configuration($id);
    wp_safe_redirect(add_query_arg([
        'post' => $di,
        'action' => 'edit'
    ], admin_url('post.php')));
    exit;
}

add_filter( 'bulk_actions-edit-prgen-configuration', 'prgen_bulk_duplicate' );
function prgen_bulk_duplicate($bulk_action){
    $bulk_action['duplicate'] = __('Duplicate ','pregen');

    return $bulk_action;
}

add_filter( 'handle_bulk_actions-edit-prgen-configuration', 'prgen_bulk_duplicate_handler', 10, 3 );
function prgen_bulk_duplicate_handler($redirect_to, $action_name, $post_ids){

    if(isset($post_ids)){
        if($action_name === "duplicate"){
           foreach ($post_ids as $key => $id) {
               prgen_duplicate_configuration($id);
           }
        }
        return $redirect_to;
    } else {
        return $redirect_to;
    }
    return $redirect_to;
}