<?php
namespace Api\Validation;

use Api\Exceptions\BadRequest;

/**
 * Klasa zbiera funkcje sprawdzające typ danych
 */
class TypeValidator {

    /**
     * Sprawdza, czy wartość jest tablicą.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsArray($value, ?string $parameter_name = null): void{
        if(isset($value)){
            if(is_array($value)) return;
        }

        $message = 'Podana wartość nie jest typu array.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu array.';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest typu bool.
     * Wartości 'true' i 'false' jako tekst są tolerowana, ale
     * liczby - nie.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsBool($value, ?string $parameter_name = null): void{
        if(isset($value)){
            if(is_bool($value)) return;
            if(is_string($value)){
                $value = strtolower($value);
                if($value === 'false') return;
                if($value === 'true') return;
            }
        }

        $message = 'Podana wartość nie jest typu bool.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu bool.';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest typu string i zawiera pełną datę i godzinę.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsDateTimeString($value, ?string $parameter_name = null): void{
        self::AssertIsString($value, $parameter_name);

        // Wyrażenia regularne, dopasowujące datę
        // Jeśli żadne nie zostanie dopasowane, zgłaszany jest wyjątek
        $accepted_formats = [
            '/^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$/'
        ];

        foreach($accepted_formats as $format){
            if(preg_match($format, $value) === 1) return;
        }

        $message = 'Podana wartość nie jest typu datetime_string.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu datetime_string.';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest liczbą całkowitą (int).
     * Liczba całkowita jako tekst (np. '0' ale nie '1.5') jest tolerowana.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsInt($value, ?string $parameter_name = null): void{
        if(isset($value)){
            if(is_int($value)) return;
            if(is_numeric($value)){
                if(is_int($value + 0)) return;
            }
        }

        $message = 'Podana wartość nie jest typu int.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu int.';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest liczbą (int lub float).
     * Liczba jako tekst (np. '0' lub '1.5') jest tolerowana.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsNumeric($value, ?string $parameter_name = null): void{
        if(isset($value)){
            if(is_int($value)) return;
            if(is_float($value)) return;
            if(is_numeric($value)) return;
        }

        $message = 'Podana wartość nie jest typu numeric.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu numeric.';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest obiektem.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsObject($value, ?string $parameter_name = null): void{
        if(isset($value)){
            if(is_object($value)) return;
        }

        $message = 'Podana wartość nie jest typu object.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu object.';
        throw new BadRequest($message);
    }

    /**
     * Sprawdza, czy wartość jest tekstem.
     * 
     * Jeśli typy się nie zgadzają, zgłaszany jest wyjątek BadRequest.
     * 
     * @param $value Wartość do sprawdzenia
     * @param $parameter_name Nazwa parametru, która zostanie zawarta w wyjątku
     */
    public static function AssertIsString($value, ?string $parameter_name = null): void{
        if(isset($value)){
            if(is_string($value)) return;
        }

        $message = 'Podana wartość nie jest typu string.';
        if(!is_null($parameter_name)) $message = 'Parametr "'.$parameter_name.'" nie jest typu string.';
        throw new BadRequest($message);
    }
}
?>