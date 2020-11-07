<?php
namespace Api\Schemas;

interface StaticData{
    public function licenses(): Licenses;
    public function question_images(): Collection;
}
?>