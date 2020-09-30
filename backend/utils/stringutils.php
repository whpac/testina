<?php
namespace Utils;

class StringUtils {

    /**
     * Konwertuje ciąg znaków UTF-8 na ciąg jednobajtowych znaków, wymaganych
     * przez funkcje PHP takie jak levenshtein().
     * 
     * Funkcja wykorzystuje (i aktualizuje z każdym wywołaniem) mapę, według
     * której znaki spoza zakresu ASCII są mapowane na zakres [128-255] w
     * kolejności wystąpienia.
     * 
     * Z tego powodu, w przekodowywanych ciągach może się pojawić maksymalnie
     * 128 znaków spoza ASCII
     * 
     * Funkcja dodana przez użytkownika do dokumentacji PHP
     * https://www.php.net/manual/en/function.levenshtein.php#113702
     * Udostępniona na licencji CC-BY 3.0
     * Komentarze przetłumaczył Marcin Szwarc
     * 
     * @param $str Ciąg znaków do przekodowania na ASCII
     * @param $map Mapa wykorzystywana do przekodowania
     */
    public static function Utf8ToExtendedAscii($str, &$map)
    {
        // Znajdź wszystkie wielobajtowe znaki (wg specyfikacji UTF-8)
        $matches = array();
        if(!preg_match_all('/[\xC0-\xF7][\x80-\xBF]+/', $str, $matches)){
            // Nie dopasowano żadnego znaku spoza ASCII, więc zwraca ciąg wejściowy
            return $str;
        }

        // Dopisuje nienapotkane wcześniej znaki do mapy
        foreach($matches[0] as $mbc){
            if(!isset($map[$mbc])){
                $map[$mbc] = chr(128 + count($map));
            }
        }

        // Mapuje znaki z UTF-8 na odpowiednie z zakresu extended ASCII
        return strtr($str, $map);
    }

    function RandomString($length){
        $chars = 'abcdefghijklmnopqrstuvwxyz';
        $chars_count = strlen($chars);

        $string = '';
        for($i = 0; $i < $length; $i++){
            $string.= $chars[random_int(0, $chars_count - 1)];
        }
        return $string;
    }
}
?>