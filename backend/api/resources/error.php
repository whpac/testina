<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Error extends Resource {
    protected $Message;

    public function __construct(string $message){
        parent::__construct();

        $this->Message = $message;
    }

    public function GetKeys(): array{
        return [
            'state',
            'message'
        ];
    }

    public function state(): string{
        return 'error';
    }

    public function message(): string{
        return $this->Message;
    }
}
?>