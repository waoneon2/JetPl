<?php

function prgen_tap($value, $callback) {
    $callback($value);

    return $value;
}

function prgen_get_current_url()
{
    global $post;

    if (is_front_page()) {
        $page_url = home_url();
    }

    $page_url = 'http';

    if (isset($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] == "on")
        $page_url .= "s";

    $page_url .= "://";

    if (isset($_SERVER["SERVER_PORT"]) && $_SERVER["SERVER_PORT"] != "80") {
        $page_url .= $_SERVER["SERVER_NAME"] . ":" . $_SERVER["SERVER_PORT"] . $_SERVER["REQUEST_URI"];
    } else {
        $page_url .= $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
    }

    return apply_filters('redirect_get_current_url', $page_url);
}