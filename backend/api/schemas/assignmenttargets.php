<?php
namespace Api\Schemas;

interface AssignmentTargets{

    public function group_ids(): array; // int[]
    public function user_ids(): array; // int[]
    public function all_user_ids(): array; // int[]
    public function link_ids(): array; // int[]
}
?>