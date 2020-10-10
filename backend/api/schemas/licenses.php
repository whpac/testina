<?php
namespace Api\Schemas;

interface Licenses{
    public function apache2(): string;
    public function cc_by_3(): string;
    public function mit(): string;
    public function sil_ofl(): string;
}
?>