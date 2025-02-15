<?php
namespace Api\Schemas;

interface User{
    public function id(): string;
    public function first_name(): string;
    public function last_name(): string;
    public function groups(): ?Collection;
    public function is_test_creator(): bool;
}
?>