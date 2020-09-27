<?php
namespace Api\Schemas;

interface AssignmentTargets{

    public function group_ids(): array; // string[]
    public function user_ids(): array; // string[]
    public function all_user_ids(): array; // string[]
}
?>