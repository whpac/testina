<?php
namespace Api\Schemas;

interface Session{
    public function is_authorized(): bool;
}
?>