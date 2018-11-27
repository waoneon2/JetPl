<?php
/**
* Jetty Media Category Widget
*/
class JettyMediaCategoryWidgetMedia extends WP_Widget
{
	
	function __construct(){
		$widget_ops = array(
            'classname' => 'JettyMediaCategoryWidgetMedia',
            'description' => __( 'Jetty Media Category on Widget.', 'jmc' ),
            'customize_selective_refresh' => true,
        );
        parent::__construct('JettyMediaCategoryWidgetMedia', __( 'Jetty Media Category', 'jmc' ), $widget_ops);
	}

	public function widget($args, $instance){
		$instance = wp_parse_args((array) $instance, $this->defaultSettings());
		$assetIMG = plugin_dir_url(__FILE__) . 'img/';

		$title = apply_filters('widget_title', empty($instance['title']) ? '' : $instance['title'], $instance, $this->id_base);

		$custom = get_option('jmc_setting_checkbox_custom_taxonomy', false);
	    if ($custom === '') {
	        $custom = false;
	    }

	    $query = array(
	        'post_type' => array('attachment','post'),
	        'post_status' => array('inherit', 'publish'),
	        'orderby'        => $instance['orderby'],
	        'order'          => $instance['order']
	    );

	    if (filter_var($instance['pagination'], FILTER_VALIDATE_BOOLEAN) ||
            (! filter_var($instance['pagination'], FILTER_VALIDATE_BOOLEAN) && $instance[ 'number' ])) {
	        $query['posts_per_page'] = (int) $instance['number'];

	        if ( $query['posts_per_page'] < 0 ) {
	            $query['posts_per_page'] = abs( $query['posts_per_page'] );
	        }
	    } else {
	        $query['nopaging'] = true;
	    }

	    $featured = false;

	    if (filter_var($instance['featured'], FILTER_VALIDATE_BOOLEAN)) {
	        $query['post_type'] = array('post');
	        $query['order'] = 'DESC';
	        $featured = true;
	    }
	    if (filter_var($instance['private'], FILTER_VALIDATE_BOOLEAN)) {
	        $query['post_status'] = array_merge($query['post_status'], ['private']);
	    }
	    $paged = 1;
	    //pagination
	    if ( get_query_var( 'paged' ) ){
	        $paged = $query['paged'] = get_query_var('paged');
	    }
	    else if ( get_query_var( 'page' ) ){
	        $paged = $query['paged'] = get_query_var( 'page' );
	    }
	    else{
	        $paged = $query['paged'] = 1;
	    }

	    $tax_query = array('relation' => 'AND');

	    if ($instance['category_slugs'] !== '' && !is_null($instance['category_slugs']) && !empty($instance['category_slugs'])) {
	        $tax_query[] = array(
	            'taxonomy' => $custom ? 'media_category' : 'category',
	            'field' => 'slug',
	            'terms' => explode(',', (string) $instance['category_slugs'])
	        );
	    }
 
	    if ($instance['tag_slugs'] !== '' && !is_null($instance['tag_slugs']) && !empty($instance['tag_slugs'])) {
	        $tax_query[] = array(
	            'taxonomy' => $custom ? 'media_tag' : 'post_tag',
	            'field'    => 'slug',
	            'terms'    => explode(',', (string) $instance['tag_slugs'])
	        );
	    }

	    if(isset($instance['exclude_tag']) && !empty($instance['exclude_tag']) && !is_null($instance['exclude_tag'])){
	        $tax_query[] = array(
	            'taxonomy' => 'post_tag',
	            'field'    => 'slug',
	            'terms'    => (string) $instance['exclude_tag'],
	            'operator' => 'NOT IN',
	        );
	    }

	    $query['tax_query'] = $tax_query;
	    $wp_query = null;

	    $wp_query = new WP_Query($query);

	
	    echo $args['before_widget'];
	    	if ( ! empty( $title ) ) {
	    		echo $args['before_title'] . $title . $args['after_title'];
	    	}
	    	if ($wp_query->have_posts()) {
		    	if($instance['display_as'] === 'video-listing'){
		    		// Video Listing widget
		    		$horizontal = $instance['layout'] === 'horizontal';
				    $html = '';
				    $content_list_horizontal = '';
				    $content_list_vertical   = '';

				    if ($wp_query->have_posts()):
				        $loop = 1;
				        $columns = $instance['columns'];
				        while ($wp_query->have_posts()): $wp_query->the_post();
				            $classes = ['jmc-video-item'];
				            if ( 0 === ( $loop - 1 ) % $columns || 1 === $columns ) {
				                $classes[] = 'first';
				            }
				            if ( 0 === $loop % $columns ) {
				                $classes[] = 'last';
				            }

				            // Horizontal
				            $content_list_horizontal .= '<div class="jmc-col-md-3">';
				            $content_list_horizontal .= '<div class="video-listing" id="horizontal-layout">';

				                if(has_post_thumbnail()){
				                    $featured_img_url = get_the_post_thumbnail_url(get_the_ID(),'large');

				                    $content_list_horizontal .= '<div class="img content">';
				                        $content_list_horizontal .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
				                    $content_list_horizontal .= '</div><!-- .img.content -->';
				                } else {
				                    $featured_img_url = $assetIMG . 'noimage.png';

				                    $content_list_horizontal .= '<div class="img content">';
				                        $content_list_horizontal .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
				                    $content_list_horizontal .= '</div><!-- .img.content -->';
				                }

				                $content_list_horizontal .= '<div class="title-wrap">';
				                    $content_list_horizontal .= '<h3 class="jmc-on-title">';
				                    	$content_list_horizontal .= '<h3 class="jmc-on-title">';
			                    	 		$content_list_horizontal .= '<a class="jmc-title-link" href="'.esc_url(get_permalink()).'" rel="bookmark">'.get_the_title().'</a>';
    					                $content_list_horizontal .= '</h3><!-- .jmc-on-title -->';
				                    $content_list_horizontal .= '</h3><!-- .jmc-on-title -->';
				                    if(filter_var($instance['display_date'], FILTER_VALIDATE_BOOLEAN)) {
				                        $content_list_horizontal .= '<small>'.get_the_date('F j, Y').'</small>';
				                    }
				                $content_list_horizontal .= '</div><!-- .title-wrap -->';

				                $content_list_horizontal .= '<div class="content-excerpt-wrap">';
				                    if (filter_var($instance['show_excerpt'], FILTER_VALIDATE_BOOLEAN)) {
				                        $content_list_horizontal .= get_the_excerpt();
				                    }
				                $content_list_horizontal .= '</div><!-- .content-excerpt-wrap -->';

				            $content_list_horizontal .= '</div><!-- .jmc-jmc-col-md-3 -->';
				            $content_list_horizontal .= '</div><!-- .video-listing -->';
				            // eof Horizontal

				            // Vertical
				            $content_list_vertical .= '<div class="jmc-col-md-4" id="on-img">';
				                if(has_post_thumbnail()){
				                    $featured_img_url = get_the_post_thumbnail_url(get_the_ID(),'large');

				                    $content_list_vertical .= '<div class="content-img">';
				                        $content_list_vertical .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img-vertical" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
				                    $content_list_vertical .= '</div><!-- .content-img -->';
				                } else {
				                    $featured_img_url = $assetIMG . 'noimage.png';

				                    $content_list_vertical .= '<div class="content-img">';
				                        $content_list_vertical .= '<img class="jmc-img-responsive jmc-img-thumbnail jmc-img-vertical" src="'.$featured_img_url.'" alt="'.get_the_title().'" title="'.get_the_title().'">';
				                    $content_list_vertical .= '</div><!-- .content-img -->';
				                }
				            $content_list_vertical .= '</div><!-- #on-img -->';

				            $content_list_vertical .= '<div class="jmc-col-md-8" id="on-content">';
				                if(filter_var($instance['display_date'], FILTER_VALIDATE_BOOLEAN)) {
				                    $content_list_vertical .= '<small>'.get_the_date('F j, Y').'</small>';
				                }

		                    	$content_list_vertical .= '<h3 class="jmc-on-title">';
		                	 		$content_list_vertical .= '<a class="jmc-title-link" href="'.esc_url(get_permalink()).'" rel="bookmark">'.get_the_title().'</a>';
				                $content_list_vertical .= '</h3><!-- .jmc-on-title -->';

				                $content_list_vertical .= '<div class="content-excerpt-wrap">';
				                if (filter_var($instance['show_excerpt'], FILTER_VALIDATE_BOOLEAN)) {
				                    $content_list_vertical .= get_the_excerpt();
				                }
				                $content_list_vertical .= '</div><!-- .content-excerpt-wrap -->';

				            $content_list_vertical .= '</div><!-- #on-content -->';
				            $content_list_vertical .= '<hr>';
				            // eof Vertical

				        $loop++;
				        endwhile;
				        wp_reset_postdata();

				        if (filter_var( $instance['pagination'], FILTER_VALIDATE_BOOLEAN )):
				            $html .= jmc_count_number_post($wp_query);
				            if($horizontal == "horizontal"){
				                $html .= '<div class="jmc-row jmc-shortcode-content-list">';
				                $html .= $content_list_horizontal;
				                $html .= '</div><!-- eof .jmc-row -->';
				            } else {
				                $html .= '<div class="jmc-row jmc-shortcode-content-list" id="vertical-layout">';
				                $html .= $content_list_vertical;
				                $html .= '</div><!-- eof .jmc-row -->';
				            }
				        endif;

				        if (filter_var( $instance['pagination'], FILTER_VALIDATE_BOOLEAN )):
				            $html .= jmc_pagination($wp_query, $paged);
				        endif;

				        if(!filter_var( $instance['pagination'], FILTER_VALIDATE_BOOLEAN )):
				            $html .= jmc_count_number_post($wp_query, true);
				            if($horizontal == "horizontal"){
				                $html .= '<div class="jmc-row jmc-shortcode-content-list">';
				                $html .= $content_list_horizontal;
				                $html .= '</div><!-- eof .jmc-row -->';
				            } else {
				                $html .= '<div class="jmc-row jmc-shortcode-content-list" id="vertical-layout">';
				                $html .= $content_list_vertical;
				                $html .= '</div><!-- eof .jmc-row -->';
				            }
				        endif;
				    else:
				        //$html .= __('No posts found', 'jmc');
				    endif;

				    echo $html;
		    		// EOF Video Listing widget
		    	} else {
		    		if($featured){
				    	echo jetty_media_category_featured_html($wp_query, $instance, $paged);
				    } else {
				    	echo jetty_media_category_print_html($wp_query, $instance, $paged);
				    }
		    	}
	    	} else {
	    		$html = __('No posts found', 'jmc');
	    		echo $html;
	    	}
		    
		echo $args['after_widget'];
				
	}

	public function form($instance){
		$instance = wp_parse_args((array) $instance, $this->defaultSettings());
		$c_custom = get_option('jmc_setting_checkbox_custom_taxonomy', false);
		$get_ex_tags = get_terms( array('taxonomy' => 'post_tag', 'hide_empty' => false) );
	    if ($c_custom === '') {
	        $c_custom = false;
	    }

	    if($c_custom){
	    	$get_category = get_terms( array('taxonomy' => 'media_category', 'hide_empty' => false) );
	    	$get_tags = get_terms( array('taxonomy' => 'media_tag', 'hide_empty' => false) );
	    } else {
	    	$get_category = get_terms( array('taxonomy' => 'category', 'hide_empty' => false) );
	    	$get_tags = get_terms( array('taxonomy' => 'post_tag', 'hide_empty' => false) );
	    }
		
		
	?>
		<div class ="jetty-category-list-tag-form">
            <p>
            	<label for="<?php echo $this->get_field_id('title'); ?>">
            		<?php _e('<span class="jmc_on_tolltip" title="Title for your widget">Title :</span>', 'jmc'); ?> 
            		<input  class="widefat" id="<?php echo $this->get_field_id('title'); ?>" name="<?php echo $this->get_field_name('title'); ?>" type="text" value="<?php echo esc_attr($instance['title']); ?>" maxlength="50"/>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('display_as'); ?>">
            		<?php _e('Shown as ? :', 'jmc'); ?> 
            		<select id="<?php echo $this->get_field_id('display_as'); ?>" name="<?php echo $this->get_field_name('display_as'); ?>" class="widefat display_as_dropdown" style="width:100%;">
					    <option <?php selected( $instance['display_as'], 'media-listing'); ?> value="media-listing">Media Listing</option>
					    <option <?php selected( $instance['display_as'], 'video-listing'); ?> value="video-listing">Video Listing</option>  
					</select>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('kwtax'); ?>">
            		<?php _e('Category :', 'jmc'); ?> 
            		<?php if(!empty($get_category)) : ?>
				        <select multiple id="<?php echo $this->get_field_id('kwtax'); ?>" name="<?php echo $this->get_field_name('kwtax'); ?>[]" class="widefat" style="width:100%;">
				            <?php foreach($get_category as $term) { ?>
				            	<?php if(in_array($term->slug, $instance['kwtax'])) : ?>
				            		<option selected="selected" value="<?php echo $term->slug; ?>"><?php echo $term->name; ?></option>
				            	<?php else : ?>
				            		<option value="<?php echo $term->slug; ?>"><?php echo $term->name; ?></option>
				            	<?php endif; ?>
				            <?php } ?>      
				        </select>
			    	<?php endif; ?>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('kwtag'); ?>">
            		<?php _e('Tag :', 'jmc'); ?> 
            		<?php if(!empty($get_tags)) : ?>
				        <select multiple id="<?php echo $this->get_field_id('kwtag'); ?>" name="<?php echo $this->get_field_name('kwtag'); ?>[]" class="widefat" style="width:100%;">
				            <?php foreach($get_tags as $term) { ?>
				            	<?php if(in_array($term->slug, $instance['kwtag'])) : ?>
				            		<option selected="selected" value="<?php echo $term->slug; ?>"><?php echo $term->name; ?></option>
				            	<?php else : ?>
				            		<option value="<?php echo $term->slug; ?>"><?php echo $term->name; ?></option>
				            	<?php endif; ?>
				            <?php } ?>      
				        </select>
			    	<?php endif; ?>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('display_date'); ?>">
            		<?php _e('Display publish dates ? :', 'jmc'); ?> 
            		<select id="<?php echo $this->get_field_id('display_date'); ?>" name="<?php echo $this->get_field_name('display_date'); ?>" class="widefat" style="width:100%;">
					    <option <?php selected( $instance['display_date'], 'false'); ?> value="false">No</option>
					    <option <?php selected( $instance['display_date'], 'true'); ?> value="true">Yes</option>  
					</select>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('number'); ?>">
            		<?php _e('Posts per page :', 'jmc'); ?> 
            		<input class="widefat" id="<?php echo $this->get_field_id('number'); ?>" name="<?php echo $this->get_field_name('number'); ?>" type="number" value="<?php echo esc_attr($instance['number']); ?>"/>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('featured'); ?>">
            		<?php _e('Featured :', 'jmc'); ?> 
            		<select id="<?php echo $this->get_field_id('featured'); ?>" name="<?php echo $this->get_field_name('featured'); ?>" class="widefat" style="width:100%;">
					    <option <?php selected( $instance['featured'], 'false'); ?> value="false">No</option>
					    <option <?php selected( $instance['featured'], 'true'); ?> value="true">Yes</option>  
					</select>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('private'); ?>">
            		<?php _e('Display Private post ? :', 'jmc'); ?> 
            		<select id="<?php echo $this->get_field_id('private'); ?>" name="<?php echo $this->get_field_name('private'); ?>" class="widefat" style="width:100%;">
					    <option <?php selected( $instance['private'], 'false'); ?> value="false">No</option>
					    <option <?php selected( $instance['private'], 'true'); ?> value="true">Yes</option>  
					</select>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('slider'); ?>">
            		<?php _e('<span class="jmc_on_tolltip" title="Display excerpt/full text/number of characters of a post with slider">Slider :</span>', 'jmc'); ?> 
            		<input class="widefat" id="<?php echo $this->get_field_id('slider'); ?>" name="<?php echo $this->get_field_name('slider'); ?>" type="text" value="<?php echo esc_attr($instance['slider']); ?>" placeholder="excerpt,full, or number of characters"/>
            	</label>
            </p>
            <p>
            	<label for="<?php echo $this->get_field_id('exclude_tag'); ?>">
            		<?php _e('Exclude Tag :', 'jmc'); ?> 
            		<select id="<?php echo $this->get_field_id('exclude_tag'); ?>" name="<?php echo $this->get_field_name('exclude_tag'); ?>" class="widefat" style="width:100%;">
			            <option <?php selected( $instance['exclude_tag'], 0 ); ?> value="0"><?php echo '- Select Tag -' ?></option>
			            <?php foreach($get_ex_tags as $term) { ?>
			            <option <?php selected( $instance['exclude_tag'], $term->slug ); ?> value="<?php echo $term->slug; ?>"><?php echo $term->name; ?></option>
			            <?php } ?>      
			        </select>
            	</label>
            </p>
            <?php 
	            if($instance['display_as'] === 'video-listing'){
	            	$cc_display = 'block';
	            } else {
	            	$cc_display = 'none';
	            }
            ?>
            <div id="just_for_video_listing" style="display: <?php echo $cc_display; ?>">
	            <p>
	            	<label for="<?php echo $this->get_field_id('layout'); ?>">
	            		<?php _e('Layout for Video Listing ? :', 'jmc'); ?> 
	            		<select id="<?php echo $this->get_field_id('layout'); ?>" name="<?php echo $this->get_field_name('layout'); ?>" class="widefat" style="width:100%;">
						    <option <?php selected( $instance['layout'], 'horizontal'); ?> value="horizontal">Horizontal</option>
						    <option <?php selected( $instance['layout'], 'vertical'); ?> value="vertical">Vertical</option>  
						</select>
	            	</label>
	            </p>
	            <p>
	            	<label for="<?php echo $this->get_field_id('show_excerpt'); ?>">
	            		<?php _e('Show excerpt of post for Video Listing ? :', 'jmc'); ?> 
	            		<select id="<?php echo $this->get_field_id('show_excerpt'); ?>" name="<?php echo $this->get_field_name('show_excerpt'); ?>" class="widefat" style="width:100%;">
						    <option <?php selected( $instance['show_excerpt'], 'false'); ?> value="false">No</option>
						    <option <?php selected( $instance['show_excerpt'], 'true'); ?> value="true">Yes</option>  
						</select>
	            	</label>
	            </p>
	            <!-- <p>
	            	<label for="<?php //echo $this->get_field_id('columns'); ?>">
	            		<?php //_e('Number of columns in Video Listing :', 'jmc'); ?> 
	            		<input class="widefat" id="<?php //echo $this->get_field_id('columns'); ?>" name="<?php //echo $this->get_field_name('columns'); ?>" type="number" value="<?php //echo esc_attr($instance['columns']); ?>"/>
	            	</label>
	            </p> -->
        	</div>
		</div>
	<?php
	}

	public function update($new_instance, $old_instance){
		$instance = $old_instance;
        $new_instance = wp_parse_args((array) $new_instance, $this->defaultSettings());

        $instance['title'] = sanitize_text_field($new_instance['title']);
        $instance['category_slugs'] = implode (", ", $new_instance['kwtax']);
        $instance['tag_slugs'] = implode (", ", $new_instance['kwtag']);
        $instance['display_date'] = sanitize_text_field($new_instance['display_date']);
        $instance['number'] = (int) sanitize_text_field($new_instance['number']);
        $instance['featured'] = sanitize_text_field($new_instance['featured']);
        $instance['private'] = sanitize_text_field($new_instance['private']);
        $instance['slider'] = sanitize_text_field($new_instance['slider']);
        $instance['exclude_tag'] = sanitize_text_field($new_instance['exclude_tag']);
        $instance['kwtax'] = esc_sql($new_instance['kwtax']);
        $instance['kwtag'] = esc_sql($new_instance['kwtag']);
        $instance['display_as'] = sanitize_text_field($new_instance['display_as']);
        $instance['layout'] = sanitize_text_field($new_instance['layout']);
        $instance['show_excerpt'] = sanitize_text_field($new_instance['show_excerpt']);
        $instance['columns'] = (int) sanitize_text_field($new_instance['columns']);

		return $instance;
	}

	protected function defaultSettings(){
		return [
            'title'          	=> __('Jetty Media Category', 'jmc'),
            'category' 			=> 0,
	        'tag' 				=> 0,
	        'category_slugs' 	=> '',
	        'tag_slugs' 		=> '',
	        'posts_per_page' 	=> -1,
	        'post_status' 		=> array('inherit','publish'),
	        'display_date'    	=> 'true',
	        'orderby'          	=> 'post_date',
	        'order'            	=> 'DESC',
	        'pagination'       	=> 'true',
	        'number'           	=> 9,
	        'featured'         	=> false,
	        'private'          	=> false,
	        'slider'           	=> '',
	        'exclude_tag'      	=> '',
	        'kwtax'				=> array(),
	        'display_as'		=> 'media-listing',
	        'layout'            => 'horizontal',
        	'show_excerpt'      => false,
        	'columns'           => 4
        ];
	}
}
?>