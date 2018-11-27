<?php

class Jetty_Image_Widget extends WP_Widget
{
    public function __construct()
    {
        $widget_ops = array(
            'classname' => 'jetty_image_widget',
            'description' => __( 'A widget that allows us to add images (logos) from the media library and add a link to image.', 'jiw' ),
            'customize_selective_refresh' => true,
        );
        parent::__construct( 'jetty_image_widget', _x( 'Jetty Image Widget', 'Jetty Image Widget' ), $widget_ops );
    }

    public function widget($args, $instance)
    {
        $title = apply_filters('widget_title', empty($instance['title']) ? '' : $instance['title'], $instance, $this->id_base);
        echo $args['before_widget'];
        if ( $title ) {
            echo $args['before_title'] . $title . $args['after_title'];
        }
        // display the images
        $media = $instance['media'];
        echo '<div class="jiw-container"><ul class="jiw jiw-items">';
        foreach ($media as $item) {
            $item = wp_parse_args((array) $item, array('image' => -1, 'url' => ''));
            if ($item['image'] === -1) continue; // dont display an empty image
            $imgUrl = wp_get_attachment_url($item['image']);
            echo '<li class="jiw-item">';
                echo ($item['url'] === '' ? '<img src="' . esc_url($imgUrl) .'">' : '<a href="' . esc_url($item['url']).'"><img src="' . esc_url($imgUrl) .'"></a>') ;
            echo '</li>';
        }
        echo '</ul></div>';

        echo $args['after_widget'];
    }

    /**
     * Helper to display a media item form on widget form below
     */
    protected function displayMediaItem($item, $i)
    {
        $item = wp_parse_args((array) $item, array('image' => -1, 'url' => ''));
        extract($item);
        ob_start();
        ?>
            <div class="media-item media-item-<?php echo $i; ?>" data-index="<?php echo $i; ?>">
                <input type="hidden" name="<?php echo $this->get_field_name("media[$i][image]"); ?>" class="jiw_repeatable_attachment_id_field" value="<?php echo esc_attr($image); ?>"/>
                <div class="jetty-image-choose-action">
                    <a href="#" class="jiw_upload_file_button button button-primary"><?php _e('Upload', 'jiw'); ?></a>
                    <a href="#" class="jetty-remove-image button button-secondary"><?php _e('Remove', 'jiw'); ?></a>
                </div>
                <figure class="image-preview">
                    <?php if ($image !== -1) {
                        $imageUrl = wp_get_attachment_url($image);
                        echo '<img class="preview-image-item preview-image-item-' . $i .'" src="' . $imageUrl .'">';
                    }
                    ?>
                </figure>
                <label for="<?php echo esc_attr("media-url-$i"); ?>"><?php _e('Link URL', 'jiw'); ?></label>
                <input type="url" id="<?php echo esc_attr("media-url-$i"); ?>" name="<?php echo $this->get_field_name("media[$i][url]"); ?>" value="<?php echo esc_url($url); ?>">
            </div>
        <?php
        return ob_get_clean();
    }

    public function form($instance)
    {
        $instance = wp_parse_args((array) $instance, array( 'title' => '', 'media' => array(), 'init' => 1));
        $title = $instance['title'];
        $media = $instance['media'];
        $init = $instance['init'];
        $more = count($media);
        if ($more < 3 && $init === 1) {
            for ($i = $more; $i < 3; $i++) {
                $media[] = array();
            }
        }
        ?>
        <div class ="jetty-image-widget-form">
            <p><label for="<?php echo $this->get_field_id('title'); ?>"><?php _e('Title:'); ?> <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($title); ?>" /></label></p>
            <input name="<?php echo $this->get_field_name('init'); ?>" type="hidden" value="-1">
            <?php
                foreach ($media as $key => $item) {
                    echo $this->displayMediaItem($item, $key);
                }
            ?>
            <button class="button jiw-add-more<?php echo ($more === 8 ? ' hidden' : ''); ?>" data-widgetbase="<?php echo esc_attr($this->number); ?>"><?php esc_html_e('Add More', 'jiw'); ?></button>
        </div>
        <?php
    }

    public function sanitizeItem($item)
    {
        $item = wp_parse_args((array) $item, array('image' => -1, 'url' => ''));
        $cleaned = array();
        $cleaned['image'] = (int) $item['image'];
        $cleaned['url'] = sanitize_text_field($item['url']);

        return $cleaned;
    }

    public function update($new_instance, $old_instance)
    {
        $instance = $old_instance;
        $new_instance = wp_parse_args((array) $new_instance, array( 'title' => '', 'media' => array(), 'init' => 1));
        // clean up user input
        $instance['title'] = sanitize_text_field($new_instance['title']);
        $instance['media'] = array_values(array_map(array($this, 'sanitizeItem'), $new_instance['media']));
        $instance['init']  = sanitize_text_field((int) $new_instance['init']);

        return $instance;
    }
}
