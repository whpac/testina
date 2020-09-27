<?php
namespace Api\Schemas;

interface AssignmentResults{
    public function user_id(): string;
    public function attempt_count(): int;
    public function last_attempt(): ?\DateTime;
    public function average_score(): ?int;
}
?>