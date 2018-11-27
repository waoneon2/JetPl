<?php

class Jetty_Readiness_Level_Widget extends WP_Widget
{
    public function __construct()
    {
        $widget_ops = array(
            'classname' => 'jetty_readiness_level_widget',
            'description' => __( 'Desc Here', 'jrlw' ),
            'customize_selective_refresh' => true,
        );
        parent::__construct( 'jetty_readiness_level_widget', _x( 'Jetty Readiness Level Widget', 'Jetty Readiness Level Widget' ), $widget_ops );
    }

    public function widget($args, $instance)
    {
        echo $args['before_widget'];
        if ( ! empty( $instance['title'] ) ) {
            echo $args['before_title'] . apply_filters( 'widget_title', $instance['title'] ). $args['after_title'];
        }
      ?>
        <div id="jrlw-accordian">
            <?php
              $acc_data = get_option( 'jrlw_form' );
                // var_dump($acc_data['active']);
                for ($i=1; $i <= $acc_data['count']; $i++) {
                    $active = ($i==$acc_data['active'])? 'jrlw-active' : '';
                    if ($acc_data['level_color'.$i] == '#ffffff'){$acc_data['level_color'.$i]='#696969';}
                    printf('<h4 class="accordion-toggle %s" style="background-color: %s ;">%s- %s<i class="fa fa-info-circle" aria-hidden="true"></i></h4>',$active,$acc_data['level_color'.$i],$i,$acc_data['level_text'.$i]);
                    echo '<div class="accordion-content ">';
                    printf('<h3>Level %s - %s </h3>',$i,ucwords(strtolower($acc_data['level_text'.$i])));
                    printf('<p>%s</p>',$acc_data['level_dec'.$i]);
                    echo'</div>';
                }
            ?>
        </div>
        <script type="text/javascript">

        </script>
      <?php
      echo $args['after_widget'];
    }

    public function form($instance)
    {
        $title  = ( isset( $instance[ 'title' ] ) ) ? $instance[ 'title' ] : 'READINESS LEVEL';
        ?>
        <p>
            <label for="<?php echo $this->get_field_id( 'title' ); ?>"><?php _e( 'Title:' ); ?></label>
            <input class="widefat" id="<?php echo $this->get_field_id( 'title' ); ?>" name="<?php echo $this->get_field_name( 'title' ); ?>" type="text" value="<?php echo esc_attr( $title ); ?>">
        </p>
        <?php
    }

    public function update($new_instance, $old_instance)
    {
        $instance = array();
        $instance['title'] = ( ! empty( $new_instance['title'] ) ) ? strip_tags( $new_instance['title'] ) : '';
        return $instance;
    }
}
