<?php
namespace Database\Translators;

/**
 * Ogólny interfejs opisujący tłumacza zapytań
 */
interface Translator {
    public static function TranslateQuery($query);
}
?>