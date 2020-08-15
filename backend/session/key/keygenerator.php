<?php
namespace Session\Key;

// Długość klucza w bajtach
define('KEY_LENGTH', 32);

/**
 * Generator losowego klucza sesji
 */
class KeyGenerator {

    /**
     * Generuje losowy klucz sesji, zwraca go jako ciąg cyfr szesnastkowych
     */
    public static function Generate(){
        if(!function_exists('random_bytes')) return self::RandomStr(KEY_LENGTH * 2);
        try{
            $string = bin2hex(random_bytes(KEY_LENGTH));
        }catch(\Exception $e){
            $string = self::RandomStr(KEY_LENGTH * 2);
        }
        return $string;
    }

    /**
     * Funkcja zapasowa, używana kiedy nie ma lepszego generatora liczb losowych.
     * Wygenerowany ciąg będzie się składał wyłącznie z cyfr szesnastkowych
     * @param $length Ilość znaków
     */
    private static function RandomStr($length){
        $str = '';
        $keyspace = '0123456789abcdef';
        $max = mb_strlen($keyspace, '8bit') - 1;
        for($i = 0; $i < $length; $i++){
            $str .= $keyspace[rand(0, $max)];
        }
        return $str;
    }
}
?>