<?php

/**
 * abstract class for Prgen Products
 */
abstract class Prgen
{
    protected $id = "";
    protected $title = "";
    protected $description = "";
    protected $imageId = "";
    protected $imageUrl = "";
    protected $imageUrlFull = "";
    protected $disclaimer = "";
    protected $partNumber = "";
    protected $open = false;
    protected $multiple = "";
    protected $force = "";
    protected $require = "";
    protected $color = "";
    protected $logicDisplay = "";
    protected $logicType = "";
    protected $logicRules = "";
    protected $childs = "";
    protected $slug = "";

    public function __set($property, $value)
    {
        if (property_exists($this, $property)) {
            $this->$property = $value;
        }
    }

    public function __get($property)
    {
        if (property_exists($this, $property)) {
            return $this->$property;
        }
    }

    public function __call($method, $parameter = [])
    {
        if (!method_exists($this, $method)) {
            // Get the method prefix to determine action
            $prefix = substr($method, 0, 3);
            // Get the attribute to do action with
            $property = lcfirst(substr($method, 3));
            
            // Check action (Set/Get)
            if ($prefix == 'set' && count($parameter) == 1) {
                // Get the parameter value
                $value = $parameter[0];
                $this->{$property} = $value;
            } elseif ($prefix == 'get') {
                return $this->{$property};
            } else {
                return call_user_func_array([$this, $method], $parameter);
            }
        }
    }

    public function toArray()
    {
        return get_object_vars($this);
    }
}
