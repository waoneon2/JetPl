<?php

/**
 * Prgen Category storage class
 */
class Prgen_Category extends Prgen
{

    private $arrayQuery;
    
    public function __construct(WP_Term $term, array $arrayQuery)
    {
        $imageId = @_prgen_flatten_array(get_term_meta($term->term_id))[0];
        $this->id            = $term->term_id;
        $this->slug          = $term->slug;
        $this->title         = $term->name;
        $this->description   = $term->description;
        $this->imageId       = $imageId;
        $this->imageUrl      = wp_get_attachment_image_url($imageId, "thumbnail");
        $this->imageUrlFull  = wp_get_attachment_image_url($imageId, "full");

        $this->arrayQuery = $arrayQuery;
    }

    public function fetchProducts()
    {
        $products = $this->toArray();
        // unset
        unset($products["arrayQuery"]);
        return $products;
    }

    public function getArrayQuery()
    {
        return $this->arrayQuery;
    }
}