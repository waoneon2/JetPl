<?php

function _prgen_model_autoload($class)
{
    require __DIR__ . "/" . $class . ".php";
}

spl_autoload_register("_prgen_model_autoload");