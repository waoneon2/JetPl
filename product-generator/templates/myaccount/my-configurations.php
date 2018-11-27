
<?php

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}
$base_url = get_permalink(prgen_get_page_my_account());
// print_r($base_url);
if (!empty($configs->posts)) {

    if (isset($_GET['duplicate']) && $_GET['duplicate']) {
        prgen_duplicate_configuration($_GET['duplicate']);
        echo '<script type="text/javascript">
            window.location.href = "'.$base_url.'"
        </script>';
        return;
    }

    // delete
    if (isset($_GET['del']) && $_GET['del']) {

        $del_id = $_GET['del'];

        wp_delete_post( $del_id, true );

        echo '<script type="text/javascript">
            window.location.href = "'.$base_url.'"
        </script>';
        return;
    }
    ?>

    <?php
    // Update table
    $content_table = '<div class="account_detail">';
    $content_table .= '<table border="1">';
        $content_table .= '<thead style="background-color:#e3e3e3">';
            $content_table .= '<tr>';
                $content_table .= '<th rowspan="2" width="10%">Config ID</th>';
                $content_table .= '<th rowspan="2">Config Title</th>';
                $content_table .= '<th rowspan="2">Date</th>';
                $content_table .= '<th colspan="4" align="center" width="400">Action</th>';
            $content_table .= '</tr>';

            $content_table .= '<tr>';
                $content_table .= '<th>View</th>';
                $content_table .= '<th>Edit</th>';
                $content_table .= '<th>Duplicate</th>';
                $content_table .= '<th>Delete</th>';
            $content_table .= '</tr>';
        $content_table .= '</thead>';

        $content_table .= '<tbody>';
            foreach ($configs->posts as $key => $value) {
                $part_id = get_post_meta($value->ID, 'prgen_parts', true);
                $parts = explode(',', $part_id);

                $product_id = get_post_meta($value->ID, 'prgen_product_id', true);


                //Product Data.
                $product_data = get_post($product_id);
                if (isset($product_data)) {
                    $product_meta['disclaimer']     = get_post_meta($product_data->ID, 'prgen_disclaimers', true);
                    $product_meta['part_number']    = get_post_meta($product_data->ID, 'prgen_part_number', true);
                    $product_meta['image_full']     = wp_get_attachment_image_src(get_post_thumbnail_id($product_data->ID), 'full');
                    $product_meta['image']          = wp_get_attachment_image_src(get_post_thumbnail_id($product_data->ID), 'thumbnail');
                }
                //Option Data.
                $option_data = get_posts( array(
                    'post__in' => $parts,
                    'post_type'   => 'prgen-products-conf',
                    'post_status' => 'publish'
                ) );

                $view_link = add_query_arg([
                    'oid' => $value->ID
                ], prgen_get_current_url());

                $edit_link = add_query_arg([
                    'config' => $value->ID
                ], get_permalink($product_id));

                $duplicate_link = add_query_arg([
                    'duplicate' => $value->ID,
                    'dn'        => urlencode($value->post_title)
                ], prgen_get_current_url());

                $delete_link = add_query_arg([
                    'del'      => $value->ID
                ], prgen_get_current_url());

                $content_table .= '<tr>';
                    $content_table .= '<td>'.$value->ID.'</td>';

                    $content_table .= '<td class="prgen-conview prgen-title">';
                        $content_table .= $value->post_title;
                    $content_table .= '</td>';

                    $content_table .= '<form method="post">';
                        $content_table .= '<input type="hidden" name="prgen-conform[ID]" value="'.(isset($value->ID) ? esc_attr($value->ID) : '').'" />';
                        $content_table .= '<td class="prgen-conform prgen-title" style="display: none;">';
                            $content_table .= '<input type="text" name="prgen-conform[name]" value="'.(isset($value->post_title) ? esc_attr($value->post_title) : '').'" maxlength="30"/>';
                            $content_table .= '<button type="submit" class="prgen-save-configuration"><span class="dashicons dashicons-yes"></span></button>';
                        $content_table .= '</td>';
                    $content_table .= '</form>';

                    $content_table .= '<td>'.$value->post_date.'</td>';
                    $content_table .= '<td><a href="'.$view_link.'"><span class="dashicons dashicons-visibility"></span></a></td>';
                    $content_table .= '<td><a href="'.$edit_link.'"  target="_blank"><span class="dashicons dashicons-edit"></span></a></td>';
                    $content_table .= '<td><a href="'.$duplicate_link.'"  ><span class="dashicons dashicons-admin-page"></span></a></td>';
                    $content_table .= '<td>';
                        $content_table .= '<a href="'.$delete_link.'" onclick="return confirm(\'Delete option?\')">';
                            $content_table .= '<span class="dashicons dashicons-trash"></span>';
                        $content_table .= '</a>';
                    $content_table .= '</td>';

                $content_table .= '</tr>';
            }
        $content_table .= '</tbody>';
    $content_table .= '</table>';
    $content_table .= '</div>';

    echo $content_table; ?>

    <?php
        $paginate = paginate_links( array(
            'base'      => str_replace( PHP_INT_MAX, '%#%', esc_url( get_pagenum_link( PHP_INT_MAX ) ) ),
            'format'    => '?paged=%#%',
            'current'   => max( 1, absint( get_query_var( 'paged' ) ) ),
            'total'     => $configs->max_num_pages,
            'type'      => 'array',
            'prev_text' => '&laquo;',
            'next_text' => '&raquo;',
        ) );
        ?>
    <div class="prgen-pagination-count">
        <?php if ( ! empty( $paginate ) ) : ?>
            <ul class="prgen-pagination">
                <?php foreach ( $paginate as $key => $page_link ) : ?>
                    <li class="paginated_link<?php if ( strpos( $page_link, 'current' ) !== false ) { echo ' active'; } ?>"><?php echo $page_link ?></li>
                <?php endforeach ?>
            </ul>
        <?php endif ?>
    </div>
    <?php
    // EOF Update table
} else {
    _e('<h4>You do not have any configurations saved.','prgen');
}