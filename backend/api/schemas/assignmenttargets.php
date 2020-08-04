<?php
namespace Api\Schemas;

interface AssignmentTargets{

    public function groups(): Collection;
    public function users(): Collection;
}
?>