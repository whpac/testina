<?php
namespace Utils;

class ArrayUtils{

    /**
     * Zamienia tablicę na ciąg elementów oddzielonych przecinkami
     * 
     * ['a', 'b'] => 'a, b'
     * @param $array Tablica do przetworzenia
     */
    public static function ArrayToList(array $array){
        $output = '';

        for($i = 0; $i < count($array); $i++){
            if($i > 0) $output .= ', ';
            $output .= $array[$i];
        }

        return $output;
    }

    /**
     * Iteruje po elementach tablicy. Każda wartość tekstowa jest otaczana cudzysłowami.
     * Dodatkowo, znaki cudzysłowu wewnątrz poprzedzane są odwrotnym ukośnikiem
     * @param $array Tablica do zmodyfikowania
     * @param $quote Znak cudzysłowu, który zostanie użyty
     */
    public static function QuoteEachString(array $array, string $quote = '"'){
        for($i = 0; $i < count($array); $i++){
            if(is_null($array[$i])){
                $array[$i] = 'NULL';
            }elseif(is_string($array[$i])){
                $array[$i] = $quote.addslashes($array[$i]).$quote;
            }
        }
        return $array;
    }
}
?>