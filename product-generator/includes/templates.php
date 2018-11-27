<?php
/**
 * Template handling for Product Generator
 */

function prgen_get_template_part($slug, $name = '')
{
    $template = '';

    if ($name && !PRGEN_TEMPLATE_DEBUG_MODE) {
        $template = locate_template(["{$slug}-{$name}.php", "product-generator/{$slug}-{$name}.php"]);
    }

    if (!$template && $name && file_exists(PRGEN_PLUGIN_DIR . "/templates/{$slug}-{$name}.php")) {
        $template = PRGEN_PLUGIN_DIR . "templates/{$slug}-{$name}.php";
    }

    // If template file doesn't exist, look in yourtheme/slug.php and yourtheme/woocommerce/slug.php
    if (! $template && !PRGEN_TEMPLATE_DEBUG_MODE ) {
        $template = locate_template(["{$slug}.php", "product-generator/{$slug}.php"]);
    }

    $template = apply_filters('prgen_get_template_part', $template, $slug, $name);

    if ($template) {
        load_template( $template, false );
    }
}

function prgen_get_template($template_name, $args = [], $template_path = '', $default_path = '' ) {
    if (! empty($args) && is_array($args)) {
        extract( $args );
    }

    $located = prgen_locate_template($template_name, $template_path, $default_path);

    if (! file_exists($located)) {
        _doing_it_wrong( __FUNCTION__, sprintf(__( '%s does not exist.', 'prgen'), '<code>' . $located . '</code>'), '0.0.1' );
        return;
    }

    // Allow 3rd party plugin filter template file from their plugin.
    $located = apply_filters('prgen_get_template', $located, $template_name, $args, $template_path, $default_path);

    do_action('prgen_before_template_part', $template_name, $template_path, $located, $args);

    include $located;

    do_action('prgen_after_template_part', $template_name, $template_path, $located, $args);
}

/**
 * Locate template.
 *
 * Locate the called template.
 * Search Order:
 * 1. /themes/theme/product-generator/$template_name
 * 2. /themes/theme/$template_name
 * 3. /plugins/product-generator/templates/$template_name.
 *
 *
 * @param   string  $template_name          Template to load.
 * @param   string  $string $template_path  Path to templates.
 * @param   string  $default_path           Default path to template files.
 * @return  string                          Path to the template file.
 */
function prgen_locate_template($template_name, $template_path = '', $default_path = '')
{

    // Set variable to search in product-generator folder of theme.
    if (!$template_path):
        $template_path = 'product-generator/';
    endif;

    // Set default plugin templates path.
    if (!$default_path):
        $default_path = PRGEN_PLUGIN_DIR . 'templates/'; // Path to the template folder
    endif;

    // Search template file in theme folder.
    $template = locate_template(array(
        $template_path . $template_name,
        $template_name
    ));

    // Get plugins template file.
    if (!$template):
        $template = $default_path . $template_name;
    endif;

    return apply_filters('prgen_locate_template', $template, $template_name, $template_path, $default_path);
}

function prgen_body_classes($classes)
{
    $classes = (array) $classes;
    if (is_singular('prgen-products-conf') || is_post_type_archive( 'prgen-products-conf' )) {
        $classes[] = 'prgen';
    }
    return $classes;
}
add_filter('body_class', 'prgen_body_classes');

function prgen_template_loader($template)
{
    if (is_embed()) return $template;

    $default_file = '';
    if (is_singular('prgen-products-conf')) {
        $default_file = 'single-product.php';
    } else if (is_post_type_archive( 'prgen-products-conf' )) {
        $default_file = 'archive-product.php';
    }

    if ($default_file) {
        $search_files = apply_filters('prgen_template_loader_files', [], $default_file);
        $search_files[] = 'product-generator.php';
        $search_files[] = $default_file;
        $search_files[] = 'product-generator/' . $default_file;
        $search_files = array_unique($search_files);

        $template     = locate_template($search_files);
        if (! $template || PRGEN_TEMPLATE_DEBUG_MODE ) {
            $template = PRGEN_PLUGIN_DIR . 'templates/' . $default_file;
        }
    }
    return $template;
}
add_filter('template_include', 'prgen_template_loader');

if (!function_exists('prgen_output_content_wrapper')):
    function prgen_output_content_wrapper() {
        prgen_get_template('common/wrapper-start.php');
    }
endif;
add_action('prgen_before_main_content', 'prgen_output_content_wrapper');

if (!function_exists('prgen_output_content_wrapper_end')):
    function prgen_output_content_wrapper_end() {
        prgen_get_template('common/wrapper-end.php');
    }
endif;
add_action('prgen_after_main_content', 'prgen_output_content_wrapper_end');

if (!function_exists('prgen_template_single_title')):
    function prgen_template_single_title() {
        prgen_get_template('single-product/title.php');
    }
endif;
//add_action('prgen_single_product_summary', 'prgen_template_single_title', 5);

if (!function_exists('prgen_template_single_thumbnail')):
    function prgen_template_single_thumbnail() {
        prgen_get_template('single-product/product-thumbnail.php');
    }
endif;
//add_action('prgen_single_product_summary', 'prgen_template_single_thumbnail');

if (!function_exists('prgen_user_account_shortcode')) {
    function prgen_user_account_shortcode() {
        if (! is_user_logged_in()) {
            prgen_get_template( 'myaccount/form-login.php' );
        } else {
           if (isset($_GET['oid'])) {
                return prgen_get_template('myaccount/account-detail.php');
           }
           $paged = (get_query_var('paged')) ? get_query_var('paged') : 1;
           $configs = prgen_get_product_configuration([
                'author'      => get_current_user_id(),
                'paged'       => $paged
           ]);
            return prgen_get_template('myaccount/my-account.php', [
                'configs' => $configs
            ]);
        }
    }
}
add_shortcode('prgen-user-account', 'prgen_user_account_shortcode');

function prgen_product_configurator($atts, $content){
    get_header('product-generator');

    do_action('prgen_before_main_content');
    do_action('prgen_main_content');
    do_action('prgen_after_main_content');

    do_action('prgen_sidebar');

    get_footer('product-generator');
}
add_shortcode( 'configurator', 'prgen_product_configurator' );

function prgen_render_product_series() {
    if (!function_exists('_prgen_product_get_category_series')) {
        require dirname(__DIR__) . '/admin/admin-functions.php';
    }
    $series = _prgen_product_get_category_series();
    $productContent = "";
    if (!is_array($series)) $series = [$series];
    foreach ($series as $sr) {
        $productContent .=  '<div class="col1of4 center">';
        $productContent .=  '   <h4>'.$sr->title.'</h4>';
        $productContent .=  '   <div class="thumbnail"><a href="#"onClick="(function(){window.mithrilMain(\''.$sr->slug.'\');return false;})();return false;"><img src="'.$sr->imageUrl.'"></a></div>';
        $productContent .=  '</div>';
    }

    ?>
    <div class="prgen">
        <div class="prgen_header ">
            <div class="prgen_header_title">
                <h1>Build Your Oven</h1>
            </div>
            <div class="prgen_header_step prgen_overauto">
                <div class="col1of3">
                    <h4>STEP 1. Please choose <b>series of products</b></h4>
                </div>
                <div class="col1of3" style="float: none;">
                    <ul class="prgen_step_num">
                        <li class="active">1</li>
                        <li class="">2</li>
                        <li class="">3</li>
                        <li class="">4</li>
                        <li class="">5</li>
                        <li class="">6</li>
                    </ul>
                </div>
            </div>
        </div>
        <ul class="breadcrump">
            <li>Choose a product</li>
        </ul>
        <div class="prgen_body prgen_overauto">
            <?php echo $productContent; ?>
        </div>
    </div>
    <?php
}
add_action('prgen_main_content', 'prgen_render_product_series');

if (!function_exists('prgen_display_product_shortcode')) {
    function prgen_display_product_shortcode($atts, $content) {
        global $wp_query, $post;
        $atts = shortcode_atts(array(
                    'posts_per_page'    => 1,
                    'post_type'         => 'prgen-products-conf',
                    'post_status'       => 'publish',
                    'name'              => '',
                    'p'                 => '')
                   , $atts
                );

        if($atts['name'] === '' && $atts['p'] === ''){
            return;
        } else {
            $posts = new WP_Query($atts);
            if ($posts->have_posts()) {
                while ($posts->have_posts()){
                    $posts->the_post();
                    prgen_get_template('common/wrapper-start.php');
                    prgen_get_template('single-product/title.php');
                    prgen_get_template('single-product/product-thumbnail.php');
                    prgen_get_template('common/wrapper-end.php');
                }
            } else {
                return;
            }
        }

        wp_reset_postdata();
    }
}
add_shortcode('prgen-display', 'prgen_display_product_shortcode');