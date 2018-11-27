<?php

function prgen_db_transaction($callback)
{
    global $wpdb;
    $wpdb->query("START TRANSACTION");
    try {
        return prgen_tap($callback($wpdb), function ($result) use ($wpdb) {
            $wpdb->query("COMMIT");
        });
    } catch (Exception $e) {
        $wpdb->query("ROLLBACK");
        throw $e;
    }
}