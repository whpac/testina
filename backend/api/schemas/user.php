<?php
namespace Api\Schemas;

interface User{
    public function id(): int;
    public function first_name(): string;
    public function last_name(): string;
}
?>