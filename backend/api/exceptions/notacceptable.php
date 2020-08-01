<?php
namespace Api\Exceptions;

class NotAcceptable extends \Exception{
    protected $accept;

    public function __construct($accept = null, $code = 0, \Exception $previous = null){
        $full_message = 'None of the following `'.$accept.'` can be returned by the server.';
        parent::__construct($full_message, $code, $previous);

        $this->accept = $accept;
    }

    public function GetClientAccept(){
        return $this->accept;
    }
}
?>