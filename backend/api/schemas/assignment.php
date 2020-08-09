<?php
namespace Api\Schemas;

interface Assignment{
    public function id(): int;
    public function attempt_limit(): int;
    public function time_limit(): \DateTime;
    public function assignment_date(): \DateTime;
    public function score_current(): ?float;
    public function test(): Test;
    public function assigned_by_id(): int;

    public function attempt_count(): int;
    public function attempts(): Collection; // <Attempt>

    public function target_count(): ?int;
    public function targets(): ?AssignmentTargets; // <User | Group>
}
?>