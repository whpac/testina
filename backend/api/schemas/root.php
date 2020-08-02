<?php
namespace Api\Schemas;

interface Root{
    public function assignments(): array; // Assignment[]
    public function groups(): array; // Group[]
    public function tests(): array; // Test[]
    public function users(): array; // User[]
}
?>