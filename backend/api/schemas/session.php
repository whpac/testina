<?php
namespace Api\Schemas;

interface Session{
    public function is_authorized(): bool;
    public function expire_time(): ?string;
}
?>