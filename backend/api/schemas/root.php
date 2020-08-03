<?php
namespace Api\Schemas;

interface Root{
    public function assignments(): Collection; // <Assignment>
    public function groups(): Collection; // <Group>
    public function tests(): Collection; // <Test>
    public function users(): Collection; // <User>
}
?>