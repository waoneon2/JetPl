<?php

class Jetty_Readiness_Level_Setting
{
    // hold option value
    private $options;

    public function __construct()
    {
        add_action( 'admin_menu', array( $this, 'add_menu_setting' ) );
        add_action( 'admin_init', array( $this, 'register_setting' ) );

    }

    public function add_menu_setting()
    {
        add_options_page(
            __( 'Readiness Level Setting Page', 'jrlw' ),
            __( 'Readiness Level', 'jrlw' ),
            'manage_options',
            'jrlw-setting',
            array( $this, 'setting_page' )
        );
    }

    public function setting_page()
    {
        $this->options = get_option( 'jrlw_form' );
        $count = isset($this->options['count']) ? $this->options['count'] : 1;
        ?>
        <div class="wrap">
            <h1><?php echo  __( 'Readiness Level Setting Page', 'jrlw' ) ?></h1>
            <form method="post" action="options.php">
            <?php
              settings_fields( 'jrlw_form_group' );
              do_settings_sections( 'jrlw_form_group' );
            ?>
            <input type="hidden" class="jrlw-form-count" name="jrlw_form[count]" value="<?php echo isset($this->options['count']) ? $this->options['count'] : 1 ?>" >
            <table class="form-table jrlw-form-table" border="0">
              <tr valign="top" class="jrlw-title">
                <th scope="row">Set Active Level</th>
                <td>
                  <select name="jrlw_form[active]" class="jrlw-inputs" >
                    <option value="0" >Deactivate</option>
                    <?php for ($i=0; $i < $count; $i++) {
                      $lv = $i + 1;
                      $level_text_len = strlen($this->options['level_text'.$lv]);
                      $level_text = $this->options['level_text'.$lv];
                      if($level_text_len > 61){
                        $select_value = substr($level_text,0,60).'...';
                      } else {
                        $select_value = $level_text;
                      }
                      echo '<option value="'. $lv.'" '.(($this->options['active'] ==  $lv) ? 'selected' : '').'>Level '.$lv.' - '.$select_value.'</option>';
                    } ?>
                  </select>
                </td>
              </tr>
              <?php for ($i=0; $i < 20; $i++): ?>
                <?php $lv = $i + 1; ?>
                <?php $display = ($lv <= $count) ? 'table-row-group' : 'none'; ?>
                <tbody class="jrlw-form-level jrlw-form-level<?php echo $lv ?>" style="display: <?php echo $display ?>">
                  <tr class="jrlw-level-title"><th colspan="2" >Level <?php echo $lv ?></th></tr>
                  <tr valign="top">
                    <th scope="row">Text</th>
                    <td>
                    <input type="text" name="jrlw_form[level_text<?php echo $lv ?>]" value="<?php echo isset( $this->options['level_text'.$lv] ) ? esc_attr( $this->options['level_text'.$lv]) : '' ?>" class="jrlw-inputs"/>
                    </td>
                  </tr>

                  <tr valign="top">
                    <th scope="row">Description</th>
                    <td>
                      <textarea name="jrlw_form[level_dec<?php echo $lv ?>]" class="jrlw-inputs"><?php echo isset( $this->options['level_dec'.$lv] ) ? esc_attr( $this->options['level_dec'.$lv]) : '' ?></textarea>
                    </td>
                  </tr>

                  <tr valign="top">
                    <th scope="row">Color</th>
                    <td>
                    <input type="text" name="jrlw_form[level_color<?php echo $lv ?>]" value="<?php echo isset( $this->options['level_color'.$lv] ) ? esc_attr( $this->options['level_color'.$lv]) : '#696969' ?>"
                    class="jrlw-color-picker" data-default-color="#696969"/>
                    </td>
                  </tr>
                </tbody>
              <?php endfor ?>

            </table>
            <a href="#" class="button-primary button-large jrlw-addmore">Add More Level</a>
            <a href="#" class="button jrlw-remove">Remove</a>
            <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function register_setting()
    {
        register_setting( 'jrlw_form_group', 'jrlw_form', array( $this, 'sanitize' ) );
    }

    public function sanitize( $input )
    {
        $new_input = array();
        if( isset( $input['active'] ) )
            $new_input['active'] = absint( $input['active'] );

        if( isset( $input['count'] ) )
            $new_input['count'] = sanitize_text_field( $input['count'] );

        for ($i=0; $i < $new_input['count']; $i++) {
          $lv = $i + 1;
          if( isset( $input['level_text'.$lv] ) )
              $new_input['level_text'.$lv] = sanitize_text_field( $input['level_text'.$lv] );

          if( isset( $input['level_dec'.$lv] ) )
              $new_input['level_dec'.$lv] = sanitize_text_field( $input['level_dec'.$lv] );

          if( isset( $input['level_color'.$lv] ) )
              $new_input['level_color'.$lv] = sanitize_text_field( $input['level_color'.$lv] );

          if( FALSE === $this->check_color( $new_input['level_color'.$lv] ) ) {
            // Set the error message
            //add_settings_error( 'cpa_settings_options', 'cpa_bg_error', 'Insert a valid color for Background', 'error' ); // $setting, $code, $message, $type
            // Get the previous valid value
            $new_input['level_color'.$lv] = $this->options['level_color'.$lv];
           }
        }


        return $new_input;
    }

    public function check_color( $value ) {
        if ( preg_match( '/^#[a-f0-9]{6}$/i', $value ) ) {
            return true;
        }
        return false;
    }
}


if( is_admin() )
    $my_settings_page = new Jetty_Readiness_Level_Setting();
