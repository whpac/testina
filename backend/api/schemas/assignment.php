<?php
namespace Api\Schemas;

interface Assignment{
    public function id(): int;
    public function attempt_limit(): int;
    public function time_limit(): \DateTime;
    public function assignment_date(): \DateTime;
    public function score(): ?float;
    public function test(): Test;
    public function assigned_by(): User;
    
    public function attempt_count(): int;
    public function attempts(): array; // Attempt[]
}
?>