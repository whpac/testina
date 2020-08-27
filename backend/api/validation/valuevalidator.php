<?php
namespace Api\Validation;

use Api\Exceptions\BadRequest;

/**
 * Klasa zbiera funkcje sprawdzające wartości zmiennych
 */
class ValueValidator {

    /**
     * Sprawdza, czy wartość należy do podanego przedziału domkniętego [$min, $max].
     * 
     * Jeśli wartość jest spoza zakresu, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $min Wartość minimalna
     * @param $max Wartość maksymalna
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsInRange($value, $min, $max, ?string $parameter_name = null): void{
        if($value >= $min && $value <= $max) return;

        $message = 'Podana wartość nie należy do przedziału ['.$min.', '.$max.'].';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie należy do przedziału ['.$min.', '.$max.'].';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest nieujemna.
     * 
     * Jeśli wartość jest ujemna, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsNonNegative($value, ?string $parameter_name = null): void{
        if($value >= 0) return;

        $message = 'Podana wartość nie jest nieujemna.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest nieujemna.';
        throw new BadRequest($message);
    }
}
?>