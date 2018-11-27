<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
$oid = $_GET['oid'];

$base_url = get_permalink(prgen_get_page_my_account());
$conf_data = is_numeric($oid) ? get_post($oid) : false;
if (!$conf_data) {
	echo '<script type="text/javascript">
        window.location.href = "'.$base_url.'"
    </script>'; return;
}

// Option data
$part_id  = get_post_meta($oid, 'prgen_parts', true);

//delete option
if (isset($_GET['del']) && $_GET['del']) {
	$del_id = $_GET['del'];

	if (strpos($part_id, $del_id.',') !== false) {
	   	$new_part_id = str_replace($del_id.',', '', $part_id);
	} else if (strpos($part_id, ','.$del_id) !== false) {
		$new_part_id = str_replace(','.$del_id, '', $part_id);
	} else {
		$new_part_id = str_replace($del_id, '', $part_id);
	}

	$part_id = $new_part_id;
	update_post_meta($oid, 'prgen_parts', $new_part_id);
}
// save conf title
$configuration_title = (isset($conf_data->post_title) ? esc_attr($conf_data->post_title) : '');
if (isset($_POST) && $_POST) {
	$configuration_title = $_POST['prgen-conform']['name'];
	$my_post = array(
      'ID'           => $_POST['prgen-conform']['ID'],
      'post_title'   => $_POST['prgen-conform']['name'],
  	);
  	wp_update_post( $my_post );
}

$parts = explode(',', $part_id);

$choosed_option = get_post_meta( $conf_data->ID, 'prgen_frontend_state', true);
$choosed_option = $choosed_option->choosed;
$option_data = array_filter($choosed_option,function($item) use($parts) {
	return in_array($item->id, $parts);
});

$product_id = get_post_meta($oid, 'prgen_product_id', true);

//Product Series
$prgen_series = esc_attr(get_post_meta($oid, 'prgen_series', true));
$term = get_term_by('slug', $prgen_series, 'prgen-product-series');
$prod_series['name'] = $term->name;
$thumbnail_id = absint(get_term_meta( $term->term_id, 'thumbnail_id', true ));
$prod_series['image'] = $default_images = PRGEN_PLUGIN_DIR_URL . 'assets/images/placeholder.png';
if ( $thumbnail_id ) {
    $prod_series['image'] = wp_get_attachment_thumb_url( $thumbnail_id );
}

//Product Data.
$product_data = get_post($product_id);

if ($product_data) {
	// $product_meta['disclaimer']		= get_post_meta($product_data->ID, 'prgen_disclaimers', true);
	// $product_meta['disclaimer']		= get_post_meta($product_data->ID, 'prgen_disclaimers', true);

	$product_meta['disclaimer']		= get_post_meta($product_data->ID, 'prgen_disclaimers', true);
	$product_meta['desc']			= $product_data->post_content;
	$product_meta['part_number'] 	= get_post_meta($product_data->ID, 'prgen_part_number', true);
	$product_meta['image_full'] 	= wp_get_attachment_image_src(get_post_thumbnail_id($product_data->ID), 'full');
	$product_meta['image']      	= wp_get_attachment_image_src(get_post_thumbnail_id($product_data->ID), 'thumbnail');
}

$edit_link = add_query_arg([
    'config' => $oid
], get_permalink($product_id));

$account_link = get_permalink(prgen_get_page_my_account());
?>

<div class="account_detail">
	<a href="<?php echo $account_link ?>">
		<span class="dashicons dashicons-undo"></span> <span style="position: relative;top: -4px;">List Saved Config</span>
	</a>
	<a href="<?php echo $edit_link ?>" style="float:right;" target="_blank">
		<span class="dashicons dashicons-edit"></span> <span style="position: relative;top: -4px;">Edit</span>
	</a>

	<!-- CONFIGURATION TABLE -->
	<script type="text/javascript">
		//.prgen-edit-configuration,
	 	jQuery(document).ready(function( $ ){
			$(".prgen-conview.prgen-title").on("click", function (e) {
				e.preventDefault();
				$('.prgen-conform').show();
				$('.prgen-conview').hide();
			});
	 	});
	</script>
	<style type="text/css">
		.prgen-conview.prgen-title a{
			float: right;
			position: relative;
			top: 3px;
		}
		.prgen-conform.prgen-title input{
			width: 70%;
		}
		.prgen-conform.prgen-title button{
			float: right;
			background: transparent;
	    	color: #007acc;
		}
	</style>


	<table border="1">
		<thead style="background-color:#e3e3e3">
			<th width="10%">ID</th>
			<th>Configuration Title</th>
			<th>Date</th>
		</thead>
		<tbody>
		<tr>
			<!-- edit -->
			<td><?php echo $conf_data->ID ?></td>
			<td class="prgen-conview prgen-title">
				<?php echo $configuration_title; ?>
				<a href="#" class="prgen-edit-configuration"><span class="dashicons dashicons-edit"></span></a>
			</td>
			<!-- save -->
			<form method="post">
				<input type="hidden" name="prgen-conform[ID]" value="<?php echo (isset($conf_data->ID) ? esc_attr($conf_data->ID) : '') ?>" />
				<td class="prgen-conform prgen-title" style="display: none;">
					<input type="text" name="prgen-conform[name]" value='<?php echo (isset($configuration_title) ? esc_attr($configuration_title) : '') ?>' maxlength="30"/>
					<button type="submit" class="prgen-save-configuration"><span class="dashicons dashicons-yes"></span></button>
				</td>
			</form>
			<td><?php echo $conf_data->post_date; ?></td>
		</tr>
		</tbody>
	</table>

	<table border="1">
		<?php if ($product_data): ?>
			<thead style="background-color:#e3e3e3;">
				<th colspan="2" style="text-align: center;">Product Series</th>
			</thead>
			<tbody>
			<tr>
				<td><img src="<?php echo $prod_series['image'] ?>" style="width: 50px;"/></td>
				<td><?php echo $prod_series['name'];?></td>
			</tr>
			</tbody>
		<?php else: ?>
			<thead style="background-color:#e3e3e3">
				<th>No Product</th>
			</thead>
		<?php endif ?>
	</table>

	<!-- PRODUCT TABLE -->
	<table border="1">
		<?php if ($product_data): ?>
			<thead style="background-color:#e3e3e3">
				<th>&nbsp;</th>
				<th>Product Title</th>
				<th>Part Number</th>
				<th>Description</th>
				<th>Disclaimer</th>
			</thead>
			<tbody>
				<tr>
					<td><img src="<?php echo $product_meta['image'][0] ?>" style="width: 50px;"/></td>
					<td><?php echo $product_data->post_title; ?></td>
					<td><?php echo $product_meta['part_number'] ?></td>
					<td><?php echo $product_meta['desc'] ?></td>
					<td><?php echo $product_meta['disclaimer'] ?></td>
				</tr>
			</tbody>
		<?php else: ?>
			<thead style="background-color:#e3e3e3">
				<th>No Product</th>
			</thead>
		<?php endif ?>
	</table>

	<!-- OPTION TABLE -->
	<?php if ($option_data): ?>
	<table border="1" width="100%">
		<thead style="background-color:#e3e3e3">
			<th>&nbsp;</th>
			<th>Option Title</th>
			<th>Part Number</th>
			<th>Description</th>
			<th>Disclaimer</th>
			<th>Action</th>
		</thead>
		<tbody>
		<?php foreach ($option_data as $key => $value) {

			$delete_link = add_query_arg([
			    'oid' => $oid,
			    'del' => $value->id
			], prgen_get_current_url());

			$option_meta['disclaimer']		= $value->disclaimer;
			$option_meta['desc']			= $value->description;
			$option_meta['part_number'] 	= $value->partNumber;
		  	$option_meta['image_full'] 		= $value->imageUrlFull;
			$option_meta['image']      		= $value->imageId;

			if(!$value->imageUrlFull) {
	            $value->imageUrlFull = PRGEN_PLUGIN_DIR_URL . '/assets/img/rectangle.png';
	            $value->imageId  = PRGEN_PLUGIN_DIR_URL . '/assets/img/rectangle.png';
	        }

			if ($key > 0): ?>	
			<tr>
				<td width="30%"><img src="<?php echo $value->imageUrlFull ?>" style="width: 90px;"/></td>
				<td width="15%"><?php echo $value->title; ?></td>
				<td width="15%"><?php echo $value->partNumber; ?></td>
				<td width="15%"><?php echo $value->description; ?></td>
				<td width="15%"><?php echo $value->disclaimer; ?></td>
				<td width="10%">
					 <?php if ($key!=1) : ?>
						<a href="<?php echo $delete_link ?>" onclick="return confirm('Delete option?')">
							<span class="dashicons dashicons-trash"> </span>
						</a>
					 <?php endif; ?>
				</td>
			</tr>
			<?php endif ?>

		<?php } ?>
		</tbody>
	</table>
	<?php endif ?>
</div>

