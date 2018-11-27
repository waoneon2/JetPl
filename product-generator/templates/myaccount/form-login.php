<?php 
if (! defined('ABSPATH')): 
    exit;
endif;
?>
<form method="post" class="login">
    <p class="form-row form-row-wide">
        <label for="username"><?php _e( 'Username or email address', 'prgen' ); ?> <span class="required">*</span></label>
        <input type="text" class="input-text" name="username" id="username" value="<?php if ( ! empty( $_POST['username'] ) ) echo esc_attr( $_POST['username'] ); ?>" />
    </p>
    <p class="form-row form-row-wide">
        <label for="password"><?php _e( 'Password', 'prgen' ); ?> <span class="required">*</span></label>
        <input class="input-text" type="password" name="password" id="password" />
    </p>
    <p class="form-row">
        <?php wp_nonce_field( 'prgen-login' ); ?>
        <input type="submit" class="button" name="prgen_auth_login" value="<?php esc_attr_e( 'Login', 'prgen' ); ?>" />
        <label for="rememberme" class="inline">
            <input name="rememberme" type="checkbox" id="rememberme" value="forever" /> <?php _e( 'Remember me', 'prgen' ); ?>
        </label>
    </p>
</form>

<form method="post" class="register">
    <p class="form-row form-row-wide">
        <label for="reg_username"><?php _e( 'Username', 'prgen' ); ?> <span class="required">*</span></label>
        <input type="text" class="input-text" name="username" id="reg_username" value="<?php if ( ! empty( $_POST['username'] ) ) echo esc_attr( $_POST['username'] ); ?>" />
    </p>
    <p class="form-row form-row-wide">
        <label for="reg_email"><?php _e( 'Email address', 'prgen' ); ?> <span class="required">*</span></label>
        <input type="email" class="input-text" name="email" id="reg_email" value="<?php if ( ! empty( $_POST['email'] ) ) echo esc_attr( $_POST['email'] ); ?>" />
    </p>
    <p class="form-row form-row-wide">
        <label for="reg_password"><?php _e( 'Password', 'prgen' ); ?> <span class="required">*</span></label>
        <input type="password" class="input-text" name="password" id="reg_password" />
    </p>
    <p class="form-row form-row-wide">
        <label for="reg_repassword"><?php _e( 'Repassword', 'prgen' ); ?> <span class="required">*</span></label>
        <input type="password" class="input-text" name="repassword" id="reg_repassword" />
    </p>
    <!-- Spam Trap -->
    <div style="<?php echo ( ( is_rtl() ) ? 'right' : 'left' ); ?>: -999em; position: absolute;"><label for="trap"><?php _e( 'Anti-spam', 'prgen' ); ?></label><input type="text" name="email_2" id="trap" tabindex="-1" /></div>
    <p class="form-row">
        <?php wp_nonce_field( 'prgen-register' ); ?>
        <input type="submit" class="button" name="prgen_auth_register" value="<?php esc_attr_e( 'Register', 'prgen' ); ?>" />
    </p>
</form>
