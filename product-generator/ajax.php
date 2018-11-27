<?php
/**
 * Ajax handling
 */
function prgen_ajax_save_product_option()
{
    check_ajax_referer('prgen_admin_save_option_nonce', 'nonce');
    if (isset($_POST['post_id'])) {
        
        $postid = absint($_POST['post_id']);
        $order = isset($_POST['order']) ? (array) $_POST['order'] : [];
        // execute this query in MySQL transaction
        $id = prgen_db_transaction(function ($wpdb) use ($postid, $order) {
            $id = wp_insert_post([
                'post_type'      => 'prgen-products-conf',
                'post_title'     => __('insert title here', 'prgen'),
                'post_status'    => 'publish',
                'comment_status' => 'closed',
                'ping_status'    => 'closed',
                'post_parent'    => $postid,
            ]);
            $order[] = $id;
            prgen_product_options_sort_db_order($order);
            return $id;
        });
        if ($id) {

            wp_send_json_success([
                'id' => $id
            ]);
        } else {

            wp_send_json_error([
                'message' => $id
            ]);
        }
    }
}
add_action('wp_ajax_prgen_ajax_save_product_option', 'prgen_ajax_save_product_option');

function prgen_ajax_delete_product_option()
{
    check_ajax_referer('prgen_admin_delete_option_nonce', 'nonce');
    if (isset($_POST['post_id'])) {

        $postid = absint($_POST['post_id']);

        $deleted = prgen_db_transaction(function ($wpdb) use ($postid) {
            $childs = array_map(function ($item) {
                return $item->ID;
            }, (array) prgen_get_product_childs($postid, [], OBJECT));
            $childs[] = $postid;

            $deleted = 0;
            foreach ($childs as $id) {

                if (!current_user_can('delete_post', $id)) continue;

                if (wp_delete_post($id)){
                    $deleted++;
                }
            }
            return $deleted;
        });
    }
    if ($deleted > 0) {

        wp_send_json_success([
            'deleted' => $deleted
        ]);
    } else {

        wp_send_json_error([
            'message' => $deleted
        ]);
    }
}
add_action('wp_ajax_prgen_ajax_delete_product_option', 'prgen_ajax_delete_product_option');

function prgen_ajax_sort_product_options()
{
    check_ajax_referer('prgen_admin_sort_options', 'nonce');
    $res = false;
    if (isset($_POST['order'])) {

        $order = explode(',', $_POST['order']);
        $res = prgen_product_options_sort_db_order($order);
    }
    if ($res) {

        wp_send_json_success([
            'sorted' => $res
        ]);
    } else {

        wp_send_json_error([
            'message' => $res
        ]);
    }
}
add_action('wp_ajax_prgen_ajax_sort_product_options', 'prgen_ajax_sort_product_options');

function prgen_ajax_get_product_archive_json()
{
    $catName = isset($_GET["cat_name"]) && !empty($_GET["cat_name"]) ? trim($_GET["cat_name"]) : 0;
    if (!function_exists('prgen_admin_map_product_option_js')) {
        require __DIR__ . '/admin/admin-functions.php';
    }
    $query = new WP_Query([
        'post_type'   => 'prgen-products-conf',
        'orderby'     => 'menu_order',
        'order'       => 'ASC',
        'posts_per_page' => -1,
        'nopaging'    => true,
        'post_parent' => 0,
        'post_status' => 'publish',
        'tax_query' => array(
            array(
                'taxonomy' => 'prgen-product-series',
                'field'    => 'slug',
                'terms'    => $catName,
            ),
        )
    ]);
    $data = [];
    $data = array_map(function ($item) {
        return prgen_admin_map_product_option_js((array) $item);
    }, $query->posts);
    wp_send_json_success([
        'products' => $data
    ]);
}
add_action('wp_ajax_prgen_ajax_get_product_archive_json', 'prgen_ajax_get_product_archive_json');
add_action('wp_ajax_nopriv_prgen_ajax_get_product_archive_json', 'prgen_ajax_get_product_archive_json');

function prgen_ajax_frontend_user_login() {
    check_ajax_referer('prgen_frontend_login', 'security');
    $creds    = [];
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password    = isset($_POST['password']) ? $_POST['password'] : '';

    if (empty($username)) {
        return wp_send_json_error([
            'message' => 'Username is required.'
        ]);
    }
    if (empty($password)) {
        return wp_send_json_error([
            'message' => 'password is required.'
        ]);
    }

    if (is_email($username)) {
        $user = get_user_by('email', $username);
        if (isset($user->user_login)) {
            $creds['user_login'] = $user->user_login;
        } else {
            return wp_send_json_error([
                'message' => 'A user could not be found with this email address.'
            ]);
        }
    } else {
        $creds['user_login'] = $username;
    }

    $password = base64_decode($password);
    $creds['user_password'] = $password;
    $creds['remember'] = true;

    $user = wp_signon($creds, is_ssl());
    if (is_wp_error($user)) {
        return wp_send_json_error([
            'message' => $user->get_error_message()
        ]);
    } else {
        return wp_send_json_success([
            'user' => $user->ID
        ]);
    }
}
add_action('wp_ajax_nopriv_prgen_ajax_frontend_user_login', 'prgen_ajax_frontend_user_login');

function prgen_ajax_frontend_user_register() {
    // handler, data yang dikirim, username, email, password, security
    check_ajax_referer('prgen_frontend_register', 'security');
    $creds    = [];
    $username = isset($_POST['username']) ? $_POST['username'] : '';
    $password = isset($_POST['password']) ? $_POST['password'] : '';
    $email    = isset($_POST['email']) ? $_POST['email'] : '';

    if (empty($username)) {
        return wp_send_json_error([
            'message' => 'Username is required.'
        ]);
    }

    if (empty($password)) {
        return wp_send_json_error([
            'message' => 'password is required.'
        ]);
    }

    if (empty($email)) {
        return wp_send_json_error([
            'message' => 'email is required.'
        ]);
    }
    
    $password = base64_decode($password);
    $new_user = prgen_create_new_user(sanitize_email($email), $username, $password);

    if (is_wp_error($new_user)) {
        return wp_send_json_error([
            'message' => $new_user->get_error_message()
        ]);
    }


    $creds['user_login']    = $username;
    $creds['user_password'] = $password;

    $user = wp_signon($creds, is_ssl());
    if (is_wp_error($user)) {
        return wp_send_json_error([
            'message' => $user->get_error_message()
        ]);
    } else {
        return wp_send_json_success([
            'user' => $user->ID
        ]);
    }

}
add_action('wp_ajax_nopriv_prgen_ajax_frontend_user_register', 'prgen_ajax_frontend_user_register');

function prgen_create_new_user($email, $username = '', $password = '')
{

    // Check the e-mail address
    if (empty($email) || !is_email($email)) {
        return new WP_Error('registration-error-invalid-email', __('Please provide a valid email address.', 'prgen'));
    }

    if (email_exists($email)) {
        return new WP_Error('registration-error-email-exists', __('An account is already registered with your email address. Please login.', 'prgen'));
    }

    // Handle username creation
    if (!empty($username)) {

        $username = sanitize_user($username);

        if (empty($username) || !validate_username($username)) {
            return new WP_Error('registration-error-invalid-username', __('Please enter a valid account username.', 'prgen'));
        }

        if (username_exists($username))
            return new WP_Error('registration-error-username-exists', __('An account is already registered with that username. Please choose another.', 'prgen'));
    } else {

        $username = sanitize_user(current(explode('@', $email)), true);

        // Ensure username is unique
        $append     = 1;
        $o_username = $username;

        while (username_exists($username)) {
            $username = $o_username . $append;
            $append++;
        }
    }

    // Handle password creation

    if (empty($password)) {
        return new WP_Error('registration-error-missing-password', __('Please enter an account password.', 'prgen'));
    } else {
        $password_generated = false;
    }

    // WP Validation
    $validation_errors = new WP_Error();

    if ($validation_errors->get_error_code())
        return $validation_errors;

    $new_user_data = array(
        'user_login' => $username,
        'user_pass' => $password,
        'user_email' => $email,
        'role' => get_option('default_role')
    );

    $user_id = wp_insert_user($new_user_data);

    if (is_wp_error($user_id)) {
        return new WP_Error('registration-error', '<strong>' . __('ERROR', 'prgen') . '</strong>: ' . __('Couldn&#8217;t register you&hellip; please contact us if you continue to have problems.', 'prgen'));
    }
    return $user_id;
}

function prgen_ajax_frontend_save_configuration()
{
    check_ajax_referer('prgen_frontend_save_configuration', 'security');

    $options = isset($_POST['option']) ? (array) $_POST['option'] : [];
    $parents = isset($_POST['parent']) ? (array) $_POST['parent'] : [];
    $fstate  = isset($_POST['frontend_state']) ? $_POST['frontend_state'] : '';
    $productid = isset($_POST['product_id']) ? $_POST['product_id'] : 0;
    $id        = isset($_POST['config_id']) ? $_POST['config_id'] : 0;
    $series    = isset($_POST['product_series']) ? $_POST['product_series'] : [];

    $decoded = json_decode(wp_unslash($fstate));
    $args = [
        'prgen_parts'           => implode(',', $options),
        'prgen_product_id'      => $productid,
        'prgen_product_parents' => implode(',', $parents),
        'prgen_frontend_state'  => $decoded,
        'prgen_series'          => $series
    ];

    if ($id !== 0 && is_numeric($id)) {
        $args['ID'] = $id;
    }
    $id = prgen_insert_product_configuration($args);

    if (is_wp_error($id)) {
        return wp_send_json_error([
            'message' => $id->get_error_message()
        ]);
    } else {
        return wp_send_json_success([
            'id' => $id
        ]);
    }
}
add_action('wp_ajax_prgen_ajax_frontend_save_configuration', 'prgen_ajax_frontend_save_configuration');

function prgen_ajax_get_product_configuration() {
    $id = isset($_GET['id']) ? $_GET['id'] : 0;
    if ($id === 0 || !is_numeric($id)) {
        return wp_send_json_error([
            'message' => 'Invalid Id'
        ]);
    }
    $userId = get_current_user_id();
    $config = get_post($id);
    if ($userId != $config->post_author && current_user_can('manage_option')) {
        return wp_send_json_error([
            'message'
        ]);
    }
    $meta = get_post_meta($config->ID);
    return wp_send_json_success([
        'product_id'     => isset($meta['prgen_product_id']) ? $meta['prgen_product_id'][0] : 0,
        'option_parts'   => isset($meta['prgen_parts']) ? array_map('intval', explode(',', $meta['prgen_parts'][0])) : [],
        'frontend_state' => maybe_unserialize($meta['prgen_frontend_state'][0]),
        'series'         => isset($meta['prgen_series']) ? $meta['prgen_series'][0] : '',
        'error'          => json_last_error_msg()
    ]);
}
add_action('wp_ajax_prgen_ajax_get_product_configuration', 'prgen_ajax_get_product_configuration');

function prgen_ajax_get_product_series() {
    $id = isset($_GET['id']) ? $_GET['id'] : 0;
    if ($id === 0 || !is_numeric($id)) {
        return wp_send_json_error([
            'message' => 'Invalid Id'
        ]);
    }
    $terms = array_map(function ($term) {
        return $term->slug;
    }, wp_get_post_terms($id, 'prgen-product-series', []));
    return wp_send_json_success([
        'series' => $terms
    ]);
}
add_action('wp_ajax_prgen_ajax_get_product_series', 'prgen_ajax_get_product_series');
add_action('wp_ajax_nopriv_prgen_ajax_get_product_series', 'prgen_ajax_get_product_series');
?>
