<?php
namespace Api\Schemas;

interface Test{
    public function id(): int;
    public function name(): string;
    public function author(): User;
    public function creation_date(): \DateTime;
    public function time_limit(): int;
    public function question_multiplier(): float;

    public function question_count(): int;
    public function questions(): array; // Question[]

    public function assignment_count(): ?int;
    public function assignments(): ?array; // Assignment[]
}
?>