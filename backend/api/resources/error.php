<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Schemas;

class Error extends Resource {
    protected $Exception;

    public function __construct(\Exception $exception){
        parent::__construct();

        $this->Exception = $exception;
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
        return $this->Exception->getMessage();
    }
}
?>