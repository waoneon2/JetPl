<?php
function prgen_admin_map_child_option_js($option)
{   
    $meta = get_post_meta($option['ID']);
    return [
        'id'            => $option['ID'],
        'title'         => $option['post_title'],
        'description'   => $option['post_content'],
        'sideNote'      => isset($meta['prgen_side_note']) && !empty($meta['prgen_side_note']) ? $meta['prgen_side_note'][0] : '',
        'imageId'       => get_post_thumbnail_id($option['ID']),
        'imageUrl'      => get_the_post_thumbnail_url($option['ID'], 'thumbnail'),
        'imageUrlFull'  => get_the_post_thumbnail_url($option['ID'], 'full'),
        'imageNoteId'   => isset($meta['prgen_img_note']) ? $meta['prgen_img_note'][0] : '',
        'imageNoteUrl'  => isset($meta['prgen_img_note']) ? wp_get_attachment_image_src($meta['prgen_img_note'][0])[0] : '',
        'imageNoteUrlFull' => isset($meta['prgen_img_note']) ? wp_get_attachment_image_src($meta['prgen_img_note'][0],'full')[0] : '',
        'disclaimer'    => isset($meta['prgen_disclaimers']) ? $meta['prgen_disclaimers'][0] : '',
        'partNumber'    => isset($meta['prgen_part_number']) ? $meta['prgen_part_number'][0] : '',
        'open'          => false,
        'multiple'      => isset($meta['prgen_multiple']) ? $meta['prgen_multiple'][0] : 0,
        'force'         => isset($meta['prgen_force']) ? $meta['prgen_force'][0] : 0,
        'require'       => isset($meta['prgen_require']) ? $meta['prgen_require'][0] : 0,
        'color'         => isset($meta['prgen_color']) ? $meta['prgen_color'][0] : '',
        'logicDisplay'  => isset($meta['prgen_logic_display']) ? $meta['prgen_logic_display'][0] : 'hide',
        'logicType'     => isset($meta['prgen_logic_type']) ? $meta['prgen_logic_type'][0] : 'any',
        'logicRules'    => isset($meta['prgen_logic_rules']) ? $meta['prgen_logic_rules'][0] : '',
        'childs'        => array_values(array_map(
                            'prgen_admin_map_child_option_js',
                            prgen_get_product_childs($option['ID'])))
    ];
}

function prgen_admin_map_product_option_js($option)
{

    $meta = get_post_meta($option['ID']);
    return [
        'id'            => $option['ID'],
        'title'         => $option['post_title'],
        'description'   => $option['post_content'],
        'sideNote'      => isset($meta['prgen_side_note']) && !empty($meta['prgen_side_note']) ? $meta['prgen_side_note'][0] : '',
        'imageId'       => get_post_thumbnail_id($option['ID']),
        'imageUrl'      => get_the_post_thumbnail_url($option['ID'], 'thumbnail'),
        'imageUrlFull'  => get_the_post_thumbnail_url($option['ID'], 'full'),
        'imageNoteId'   => isset($meta['prgen_img_note']) ? $meta['prgen_img_note'][0] : '',
        'imageNoteUrl'  => isset($meta['prgen_img_note']) ? wp_get_attachment_image_src($meta['prgen_img_note'][0])[0] : '',
        'disclaimer'    => isset($meta['prgen_disclaimers']) ? $meta['prgen_disclaimers'][0] : '',
        'partNumber'    => isset($meta['prgen_part_number']) ? $meta['prgen_part_number'][0] : '',
        'open'          => false,
        'multiple'      => isset($meta['prgen_multiple']) ? $meta['prgen_multiple'][0] : 0,
        'force'         => isset($meta['prgen_force']) ? $meta['prgen_force'][0] : 0,
        'require'       => isset($meta['prgen_require']) ? $meta['prgen_require'][0] : 0,
        'color'         => isset($meta['prgen_color']) ? $meta['prgen_color'][0] : '',
        'logicDisplay'  => isset($meta['prgen_logic_display']) ? $meta['prgen_logic_display'][0] : 'hide',
        'logicType'     => isset($meta['prgen_logic_type']) ? $meta['prgen_logic_type'][0] : 'any',
        'logicRules'    => isset($meta['prgen_logic_rules']) ? $meta['prgen_logic_rules'][0] : '',
        'childs'        => array_values(array_map(
                            'prgen_admin_map_child_option_js',
                            prgen_get_product_childs($option['ID'])))
    ];
}

function _prgen_get_edit_link($args, $label, $class = '')
{
    $url = add_query_arg($args, 'edit.php');

    $class_html = '';
    if (! empty($class)) {
         $class_html = sprintf(' class="%s"', esc_attr( $class ));
    }

    return sprintf('<a href="%s"%s>%s</a>',
        esc_url($url),
        $class_html,
        $label
    );
}


/**
 * Callback while getting the terms
 *
 * @param WP_Post $post
 * @return string
 */
function _prgen_get_terms(WP_Post $post, $prop = "slug")
{
    $terms = get_the_terms($post->ID, "prgen-product-series");
    if($terms && !empty($terms)) {
        return array_map(function($term) use($prop) {
            if($term && !empty($term)) return $term->{$prop};
            return "";
        }, $terms);
    }
    return "";
}



/**
 * Flaten multidimensional array
 *
 * @param array $array
 * @return array
 */
function _prgen_flatten_array(array $array)
{
    $returns = [];
    foreach (new RecursiveIteratorIterator(new RecursiveArrayIterator($array)) as $item) {
        $returns[] = $item;
    }
    if (!empty($returns)) {
        $returns = array_filter(array_unique($returns), function($v) {return !empty($v);});
    }
    return $returns;
}

/**
 * get Prgen_Category Object
 *
 * @param integer $id
 * @param array $arrayQuery
 * @return Prgen_Category
 */
function _prgen_get_category($id, $arrayQuery)
{
    return new Prgen_Category(get_term($id), $arrayQuery);
}

/**
 * mapping Prgen Category on top of array
 *
 * @param Prgen_Category $prgen
 * @return array
 */
function _prgen_map_product_option(Prgen_Category $prgen)
{
    $products = $prgen->fetchProducts();
    $products["childs"] = array_values(
                            array_map("prgen_admin_map_product_option_js", array_map(function($post) {
                                    return (array) $post;
                                }, (new WP_Query($prgen->getArrayQuery()))->posts))
                        )
    ;
    return $products;
}


function _prgen_product_get_category_series()
{
    if (!function_exists('_prgen_model_autoload')) require dirname(__DIR__). "/model/autoload.php";
    $query = new WP_Query([
        'post_type'   => 'prgen-products-conf',
        'orderby'     => 'menu_order',
        'order'       => 'ASC',
        'posts_per_page' => -1,
        'nopaging'    => true,
        'post_parent' => 0,
        'post_status' => 'publish'
    ]);
    return array_map( function($id){
            return _prgen_get_category(intval($id), []);
        },  _prgen_flatten_array(array_map(function($post){
                return _prgen_get_terms($post, "term_id");
            }, $query->posts))
        );
}