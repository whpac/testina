<?php
namespace Api\Schemas;

interface Question{
    public function id(): int;
    public function text(): string;
    public function type(): int;
    public function points(): float;
    public function points_counting(): int;
    public function max_typos(): int;

    public function answer_count(): int;
    public function answers(): array; // Answer[]
}
?>