<?php
/**
 * Custom Post Types used by Product Generator
 */

/**
 * Register custom post type
 * @return return void
 */
function prgen_register_post_types()
{
    register_post_type('prgen-products-conf', [
        'labels' => [
            'name'                  => __('Products', 'prgen'),
            'singular_name'         => __('Product', 'prgen'),
            'all_items'             => __('All Products', 'prgen'),
            'menu_name'             => _x('Products', 'Admin menu name', 'prgen'),
            'add_new'               => __('Add New', 'prgen'),
            'add_new_item'          => __('Add new product', 'prgen'),
            'edit'                  => __('Edit', 'prgen'),
            'edit_item'             => __('Edit product', 'prgen'),
            'new_item'              => __('New product', 'prgen'),
            'view'                  => __('View product', 'prgen'),
            'view_item'             => __('View product', 'prgen'),
            'search_items'          => __('Search products', 'prgen'),
            'not_found'             => __('No products found', 'prgen'),
            'not_found_in_trash'    => __('No products found in trash', 'prgen'),
            'parent'                => __('Parent product', 'prgen'),
        ],
        'description'         => __( 'This is where you can add new products configurations.', 'prgen' ),
        'public'              => true,
        'show_ui'             => true,
        'capability_type'     => 'post',
        'map_meta_cap'        => true,
        'publicly_queryable'  => true,
        'exclude_from_search' => false,
        'hierarchical'        => false,
        'rewrite'             => ['slug' => 'prgen-product', 'with_front' => false, 'feeds' => true],
        'query_var'           => true,
        'supports'            => ['title', 'editor', 'thumbnail'],
        'has_archive'         => 'products',
        'show_in_nav_menus'   => true,
        'show_in_rest'        => true,
    ]);

    register_taxonomy( 'prgen-product-series', 'prgen-products-conf', array(
      'public' => false,
      'show_ui' => true,
      'labels' => array(
        'name'                       => 'Products Series',
        'singular_name'              => 'Product Series',
        'menu_name'                  => 'Products Series',
        'search_items'               => 'Search Products Series',
        'popular_items'              => 'Popular Products Series',
        'all_items'                  => 'All Products Series',
        'edit_item'                  => 'Edit Product Series',
        'update_item'                => 'Update Product Series',
        'add_new_item'               => 'Add New Product Series',
        'new_item_name'              => 'New Product Series Name',
        'separate_items_with_commas' => 'Separate Products Series with commas',
        'add_or_remove_items'        => 'Add or remove Products Series',
        'choose_from_most_used'      => 'Choose from the most popular products series',
      ),
      'hierarchical' => true,
      'rewrite' => false,
      'capabilities' => array(
        'manage_terms' => 'edit_users',
        'edit_terms'   => 'edit_users',
        'delete_terms' => 'edit_users',
        'assign_terms' => 'read',
      ),
    ) );

    register_post_type('prgen-configuration', [
        'labels' => array(
            'name'                  => __('Saved Builds', 'prgen'),
            'singular_name'         => __('Saved Build', 'prgen'),
            'add_new'               => __('Add New'),
            'add_new_item'          => __('Add New Saved Build', 'prgen'),
            'edit'                  => __('Edit', 'prgen'),
            'edit_item'             => __('Edit Saved Build', 'prgen'),
            'new_item'              => __('New Saved Build', 'prgen'),
            'view'                  => __('View Saved Build', 'prgen'),
            'view_item'             => __('View Saved Build', 'prgen'),
            'search_items'          => __('Search Saved Builds', 'prgen'),
            'not_found'             => __('No Saved Builds found', 'prgen'),
            'not_found_in_trash'    => __('No Saved Builds found in Trash', 'prgen')
        ),
        'supports'              => ['title'],
        'exclude_from_search'   => false,
        'publicly_queryable'    => false,
        'public'                => false,
        'query_var'             => false,
        'hierarchical'          => false,
        'show_ui'               => true,
    ]);

    add_action( 'prgen-product-series_add_form_fields', 'prgen_product_series_add_tax', 10 );
    add_action( 'prgen-product-series_edit_form_fields', 'prgen_product_series_edit_tax', 10 );
    add_action( 'created_term', 'prgen_product_series_save_tax', 10, 3 );
    add_action( 'edit_term', 'prgen_product_series_save_tax', 10, 3 );
}
add_action('init', 'prgen_register_post_types');

function prgen_get_product_configuration($args)
{
    $defaults = [
        'post_type'   => 'prgen-configuration',
        'numberposts' => 10,
        'orderby'     => 'menu_order',
        'order'       =>'ASC',
        'post_status' => 'publish'
    ];
    $args = wp_parse_args($args, $defaults);
    return new WP_Query($args);
}

function prgen_insert_product_configuration($args)
{
    if ($args['ID']) {
        // if save from edit
        $defaults = get_post($args['ID'], ARRAY_A);
    } else {
        $defaults = [
            'post_author' => get_current_user_id(),
            'post_title'  => 'conf#' . strtotime("now"),
            'post_status' => 'publish'
        ];
    }

    $args = wp_parse_args($args, $defaults);
    $args['post_type'] = 'prgen-configuration';

    $id = wp_insert_post($args, true);
    if (is_wp_error($id)) {
        return $id;
    } else {
        update_post_meta($id, 'prgen_parts', $args['prgen_parts']);
        update_post_meta($id, 'prgen_series', $args['prgen_series']);
        update_post_meta($id, 'prgen_product_id', $args['prgen_product_id']);
        update_post_meta($id, 'prgen_product_parents', $args['prgen_product_parents']);
        update_post_meta($id, 'prgen_frontend_state', $args['prgen_frontend_state']);
        return $id;
    }
}

function prgen_get_product_childs($postid, $args = [], $m = ARRAY_A)
{
    $defaults = [
        'post_parent' => $postid,
        'post_type'   => 'prgen-products-conf',
        'numberposts' => -1,
        'orderby'     => 'menu_order',
        'order'       =>'ASC',
        'post_status' => 'publish',
    ];
    $args = wp_parse_args($args, $defaults);
    $children = get_children($args, $m);
    foreach ($children as $id => $val) {
        $img_note = array_key_exists('prgen_img_note', get_post_meta($id)) ? get_post_meta($id)['prgen_img_note'][0] : 0;
        if ($img_note > 0) {
            $children[$id]['prgen_img_note'] = $img_note;
        }
    }
    return $children;
}

function prgen_product_options_sort_db_order($posts = [])
{
    global $wpdb;
    if (count($posts) > 1) {
        $i = 0;
        $cases = [];
        foreach ($posts as $item_id) {
            $cases[] = "WHEN {$item_id} THEN {$i}";
            $i++;
        }
        $sql = sprintf("UPDATE %s SET menu_order = CASE ID %s END", $wpdb->posts, implode(' ', $cases));
        $sql = $wpdb->prepare($sql . " WHERE ID IN (%s)",
                    $wpdb->posts,
                    implode(' ', $cases),
                    implode(', ', $posts));
        return $wpdb->query($sql);
    }
    return false;
}

function prgen_insert_product_option($args = [])
{
    $params = [
        'post_type'      => 'prgen-products-conf',
        'post_author'    => isset($args['author']) ? $args['author'] : 0,
        'post_title'     => isset($args['post_title']) ? $args['post_title'] : __('Insert title here', 'prgen'),
        'post_content'   => isset($args['post_content']) ? $args['post_content'] : '',
        'post_status'    => 'publish',
        'comment_status' => 'closed',
        'ping_status'    => 'closed',
        'post_parent'    => isset($args['parent']) ? $args['parent'] : 0,
        'ID'             => isset($args['ID']) && !empty($args['ID']) ? $args['ID'] : null,
        'menu_order'     => isset($args['menu_order']) ? $args['menu_order'] : 0
    ];

    $post_id = wp_insert_post($params);
    if ($post_id) {
        if (isset($args['thumbnail']) && !empty($args['thumbnail'])) {
            set_post_thumbnail($post_id, $args['thumbnail']);
        } else {
            delete_post_thumbnail($post_id);
        }

        $fields = [
            'side_note',
            'img_note',
            'part_number',
            'disclaimers',
            'multiple',
            'force',
            'require',
            'color',
            'logic_display',
            'logic_type',
            'logic_rules'
        ];
        foreach ($fields as $field) {
            $value = isset($args[$field]) ? $args[$field] : '';
            if ($value) {
                update_post_meta($post_id, 'prgen_' . $field, $value);
            } else {
                delete_post_meta($post_id, 'prgen_' . $field);
            }
        }
    }
}

function prgen_post_count_exclude_childs($type, $perm)
{
    global $wpdb;

    if (! post_type_exists($type))
        return new stdClass;

    $cache_key = 'prgen_' . _count_posts_cache_key($type, $perm);

    $counts = wp_cache_get($cache_key, 'counts');
    if ( false !== $counts ) {

        return $counts;
    }

    $query = "SELECT post_status, COUNT( * ) AS num_posts FROM {$wpdb->posts} WHERE post_type = %s AND post_parent = 0";
    if ( 'readable' == $perm && is_user_logged_in() ) {
        $post_type_object = get_post_type_object($type);
        if ( ! current_user_can( $post_type_object->cap->read_private_posts)) {
            $query .= $wpdb->prepare( " AND (post_status != 'private' OR ( post_author = %d AND post_status = 'private' ))",
                get_current_user_id()
            );
        }
    }
    $query .= ' GROUP BY post_status';

    $results = (array) $wpdb->get_results($wpdb->prepare($query, $type), ARRAY_A);
    $counts = array_fill_keys(get_post_stati(), 0);

    foreach ( $results as $row ) {
        $counts[$row['post_status']] = $row['num_posts'];
    }

    $counts = (object) $counts;
    wp_cache_set($cache_key, $counts, 'counts');

    return $counts;
}

function prgen_get_page_my_account() {
    global $wpdb;
    return $wpdb->get_var("SELECT ID FROM {$wpdb->posts}
        WHERE post_content LIKE '%[prgen-user-account]%'
        AND post_type = 'page'
        LIMIT 1");
}

function prgen_get_page_configurator() {
    global $wpdb;
    return $wpdb->get_var("SELECT ID FROM {$wpdb->posts}
        WHERE post_content LIKE '%[configurator]%'
        AND post_type = 'page'
        LIMIT 1");
}

function prgen_duplicate_configuration($confid)
{
    $conf_obj = get_post($confid);
    $post_information = array(
        'post_content' => $conf_obj->post_content,
        'post_title' => $conf_obj->post_title.' (copy)',
        'post_type' => 'prgen-configuration',
        'post_status' => 'publish'
    );
    //wawan
    $part_id    = get_post_meta($confid, 'prgen_parts', true);
    $product_id = get_post_meta($confid, 'prgen_product_id', true);
    $frstate    = get_post_meta($confid, 'prgen_frontend_state', true);
    $series     = get_post_meta($confid, 'prgen_series', true);

    $duplicated_id = wp_insert_post($post_information);

    add_post_meta($duplicated_id, 'prgen_series', $series, true);
    add_post_meta($duplicated_id, 'prgen_parts', $part_id, true);
    add_post_meta($duplicated_id, 'prgen_product_id', $product_id, true);
    add_post_meta($duplicated_id, 'prgen_frontend_state', $frstate, true);
    return $duplicated_id;
}

add_filter( 'bulk_actions-edit-prgen-products-conf', 'prgen_bulk_duplicate_product' );
function prgen_bulk_duplicate_product($bulk_action){
    $bulk_action['duplicate'] = __('Duplicate ','pregen');

    return $bulk_action;
}

add_filter( 'handle_bulk_actions-edit-prgen-products-conf', 'prgen_bulk_duplicate_product_handler', 10, 3 );
function prgen_bulk_duplicate_product_handler($redirect_to, $action_name, $post_ids){
    $query = new WP_Query([
        'post__in'    => array_map('intval', $post_ids),
        'post_type'   => 'prgen-products-conf',
        'orderby'     => 'menu_order',
        'order'       => 'ASC',
        'numberposts' => -1,
        'post_parent' => 0,
        'post_status' => 'publish'
    ]);
    foreach ($query->posts as $post) {
        $duplicated_id[] = prgen_duplicate_products($post);
    }

    return $redirect_to;
}

function prgen_duplicate_products($post) {
    if (is_int($post)) {
        $post = get_post($post);
    }
    // duplicate top level
    $id = wp_insert_post([
        'post_type'      => 'prgen-products-conf',
        'post_title'     => $post->post_title . ' copy',
        'post_content'   => $post->post_content,
        'post_status'    => 'publish',
        'comment_status' => 'closed',
        'ping_status'    => 'closed',
    ]);
    $meta = get_post_meta($post->ID);
    // copy post meta
    $meta_key = [
        'part_number' => '',
        'disclaimers' => ''
    ];
    foreach ( $meta_key as $field => $default) {
        update_post_meta($id, 'prgen_' . $field, isset($meta['prgen_'.$field]) ? $meta['prgen_'.$field][0] : $default);
    }


    set_post_thumbnail($id,  get_post_thumbnail_id($post->ID));

    $childs = prgen_get_product_childs($post->ID);
    foreach ($childs as $p) {
        prgen_save_recursive($p, $id);
    }
}

function prgen_save_recursive($post, $post_parent = 0)
{
    $post_information = array(
        'post_type'      => 'prgen-products-conf',
        'post_title'     => $post['post_title'],
        'post_content'   => $post['post_content'],
        'post_status'    => 'publish',
        'comment_status' => 'closed',
        'ping_status'    => 'closed',
        'post_parent'    => $post_parent,
        'menu_order'     => $post['menu_order'],
    );
    $post_id = wp_insert_post($post_information);

    if ($post_id) {
        set_post_thumbnail($post_id,  get_post_thumbnail_id($post['ID']));
        $meta = [
            'part_number' => '',
            'disclaimers' => '',
            'multiple' => 0,
            'force' => 0,
            'require' => 0,
            'color' => '',
            'logic_display' => 'hide',
            'logic_type' => 'any',
            'logic_rules' => ''
        ];
        $old_meta = get_post_meta($post['ID']);
        foreach ( $meta as $field => $default) {
            update_post_meta($post_id, 'prgen_' . $field, isset($old_meta['prgen_'.$field]) ? $old_meta['prgen_'.$field][0] : $default);
        }
    }
    $childs = prgen_get_product_childs($post['ID']);
    foreach ($childs as $p) {
        prgen_save_recursive($p, $post_id);
    }
}



// Term
function prgen_product_series_edit_tax( $term ) {

    $thumbnail_id = absint(get_term_meta( $term->term_id, 'thumbnail_id', true ));
    $image = $default_images = PRGEN_PLUGIN_DIR_URL . 'assets/images/placeholder.png';
    if ( $thumbnail_id ) {
        $image = wp_get_attachment_thumb_url( $thumbnail_id );
    }

    ?>
    <tr class="form-field">
        <th scope="row" valign="top"><label><?php _e( 'Thumbnail', 'prgen' ); ?></label></th>
        <td>
            <div id="product_series_thumbnail" style="float: left; margin-right: 10px;"><img src="<?php echo esc_url( $image ); ?>" width="60px" height="60px" /></div>
            <div style="line-height: 60px;">
                <input type="hidden" id="product_series_thumbnail_id" name="product_series_thumbnail_id" value="<?php echo $thumbnail_id; ?>" />
                <button type="button" class="upload_image_button button"><?php _e( 'Upload/Add image', 'prgen' ); ?></button>
                <button type="button" class="remove_image_button button"><?php _e( 'Remove image', 'prgen' ); ?></button>
            </div>
            <script type="text/javascript">

                // Only show the "remove image" button when needed
                console.log(jQuery( '#product_series_thumbnail_id' ).val());
                if ( '0' === jQuery( '#product_series_thumbnail_id' ).val() ) {
                    jQuery( '.remove_image_button' ).hide();
                }

                // Uploading files
                var file_frame;

                jQuery( document ).on( 'click', '.upload_image_button', function( event ) {

                    event.preventDefault();

                    // If the media frame already exists, reopen it.
                    if ( file_frame ) {
                        file_frame.open();
                        return;
                    }

                    // Create the media frame.
                    file_frame = wp.media.frames.downloadable_file = wp.media({
                        title: '<?php _e( "Choose an image", "prgen" ); ?>',
                        button: {
                            text: '<?php _e( "Use image", "prgen" ); ?>'
                        },
                        multiple: false
                    });

                    // When an image is selected, run a callback.
                    file_frame.on( 'select', function() {
                        var attachment           = file_frame.state().get( 'selection' ).first().toJSON();
                        var attachment_thumbnail = attachment.sizes.thumbnail || attachment.sizes.full;

                        jQuery( '#product_series_thumbnail_id' ).val( attachment.id );
                        jQuery( '#product_series_thumbnail' ).find( 'img' ).attr( 'src', attachment_thumbnail.url );
                        jQuery( '.remove_image_button' ).show();
                    });

                    // Finally, open the modal.
                    file_frame.open();
                });

                jQuery( document ).on( 'click', '.remove_image_button', function() {
                    console.log("<?php echo esc_js( $default_images ) ?> ");
                    jQuery( '#product_series_thumbnail' ).find( 'img' ).attr( 'src', '<?php echo esc_js( $default_images ); ?>' );
                    jQuery( '#product_series_thumbnail_id' ).val( '' );
                    jQuery( '.remove_image_button' ).hide();
                    return false;
                });

            </script>
            <div class="clear"></div>
        </td>
    </tr>
    <?php
}

function prgen_product_series_add_tax() {
    $default_images = PRGEN_PLUGIN_DIR_URL . 'assets/images/placeholder.png';
    ?>
    <div class="form-field term-thumbnail-wrap">
        <label><?php _e( 'Thumbnail', 'prgen' ); ?></label>
        <div id="product_series_thumbnail" style="float: left; margin-right: 10px;"><img src="<?php echo esc_url( $default_images ); ?>" width="60px" height="60px" /></div>
        <div style="line-height: 60px;">
            <input type="hidden" id="product_series_thumbnail_id" name="product_series_thumbnail_id" />
            <button type="button" class="upload_image_button button"><?php _e( 'Upload/Add image', 'prgen' ); ?></button>
            <button type="button" class="remove_image_button button"><?php _e( 'Remove image', 'prgen' ); ?></button>
        </div>
        <script type="text/javascript">

            // Only show the "remove image" button when needed
            if ( ! jQuery( '#product_series_thumbnail_id' ).val() ) {
                jQuery( '.remove_image_button' ).hide();
            }

            // Uploading files
            var file_frame;

            jQuery( document ).on( 'click', '.upload_image_button', function( event ) {

                event.preventDefault();

                // If the media frame already exists, reopen it.
                if ( file_frame ) {
                    file_frame.open();
                    return;
                }

                // Create the media frame.
                file_frame = wp.media.frames.downloadable_file = wp.media({
                    title: '<?php _e( "Choose an image", "prgen" ); ?>',
                    button: {
                        text: '<?php _e( "Use image", "prgen" ); ?>'
                    },
                    multiple: false
                });

                // When an image is selected, run a callback.
                file_frame.on( 'select', function() {
                    var attachment           = file_frame.state().get( 'selection' ).first().toJSON();
                    var attachment_thumbnail = attachment.sizes.thumbnail || attachment.sizes.full;

                    jQuery( '#product_series_thumbnail_id' ).val( attachment.id );
                    jQuery( '#product_series_thumbnail' ).find( 'img' ).attr( 'src', attachment_thumbnail.url );
                    jQuery( '.remove_image_button' ).show();
                });

                // Finally, open the modal.
                file_frame.open();
            });

            jQuery( document ).on( 'click', '.remove_image_button', function() {
                jQuery( '#product_series_thumbnail' ).find( 'img' ).attr( 'src', '<?php echo esc_js( $default_images ); ?>' );
                jQuery( '#product_series_thumbnail_id' ).val( '' );
                jQuery( '.remove_image_button' ).hide();
                return false;
            });

            jQuery( document ).ajaxComplete( function( event, request, options ) {
                if ( request && 4 === request.readyState && 200 === request.status
                    && options.data && 0 <= options.data.indexOf( 'action=add-tag' ) ) {

                    var res = wpAjax.parseAjaxResponse( request.responseXML, 'ajax-response' );
                    if ( ! res || res.errors ) {
                        return;
                    }
                    // Clear Thumbnail fields on submit
                    jQuery( '#product_series_thumbnail' ).find( 'img' ).attr( 'src', '<?php echo esc_js( $default_images ); ?>' );
                    jQuery( '#product_series_thumbnail_id' ).val( '' );
                    jQuery( '.remove_image_button' ).hide();
                    return;
                }
            } );

        </script>
        <div class="clear"></div>
    </div>
    <?php
}


function prgen_product_series_save_tax( $term_id, $tt_id = '', $taxonomy = '' ) {
    if ( isset( $_POST['product_series_thumbnail_id'] ) && 'prgen-product-series' === $taxonomy ) {
        update_term_meta( $term_id, 'thumbnail_id', absint( $_POST['product_series_thumbnail_id'] ) );
    }
}