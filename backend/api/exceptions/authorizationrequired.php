<?php
namespace Api\Exceptions;

class AuthorizationRequired extends \Exception{
    protected $resource_name;

    public function __construct($resource_name = null, $code = 0, \Exception $previous = null){
        $full_message = 'You have to authenticate yourself in order to access `'.$resource_name.'`.';
        parent::__construct($full_message, $code, $previous);

        $this->resource_name = $resource_name;
    }

    public function GetResourceName(){
        return $this->resource_name;
    }
}
?>