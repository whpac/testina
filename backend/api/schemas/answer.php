<?php
namespace Api\Schemas;

interface Answer{
    public function id(): int;
    public function text(): string;
    public function correct(): bool;
    public function order(): int;
}
?>