<?php
namespace Api\Schemas;

interface Attempt{
    public function id(): int;
    public function user(): User;
    public function score(): ?float;
    public function max_score(): float;
    public function begin_time(): \DateTime;

    public function questions(): ?array; // Question[]
    public function path(): ?array; // int[]
    public function answers(); // Writeonly
}
?>