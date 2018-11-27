<?php

/**
 * Prgen Size storage class
 */
class Prgen_Size extends Prgen
{

    private $arrayQuery;
    
    public function __construct(Prgen_Category $cat)
    {
        $imageId = _prgen_flatten_array(get_term_meta($term->term_id))[0];
        $this->id            = 0;
        $this->title         = $term->name;
        $this->description   = $term->description;
        $this->imageId       = "";
        $this->imageUrl      = false;
        $this->imageUrlFull  = false;

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