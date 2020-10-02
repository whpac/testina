<?php
namespace Api\Schemas;

interface Test{
    public function id(): int;
    public function name(): string;
    public function author_id(): string;
    public function creation_date(): \DateTime;
    public function time_limit(): int;
    public function description(): ?string;
    public function type(): int;
    public function score_counting(): int;
    public function final_title(): string;
    public function final_text(): string;
    public function question_multiplier(): float;

    public function question_count(): int;
    public function questions(): ?Collection; // <Question>

    public function assignment_count(): ?int;
    public function assignment_ids(): ?array; // int[]
}
?>