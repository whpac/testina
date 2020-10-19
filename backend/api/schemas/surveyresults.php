<?php
namespace Api\Schemas;

interface SurveyResults{

    public function questions(): Collection;
}
?>