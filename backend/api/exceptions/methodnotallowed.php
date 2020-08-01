<?php
namespace Api\Exceptions;

class MethodNotAllowed extends \Exception{
    protected $method;

    public function __construct($method = null, $code = 0, \Exception $previous = null){
        $full_message = 'Method `'.$method.'` is not allowed.';
        parent::__construct($full_message, $code, $previous);

        $this->method = $method;
    }

    public function GetMethod(){
        return $this->method;
    }
}
?>