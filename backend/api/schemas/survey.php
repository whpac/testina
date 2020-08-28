<?php
namespace Api\Schemas;

interface Survey{
    public function id(): int;
    public function author_id(): int;
    public function name(): string;
    public function description(): ?string;
}
?>