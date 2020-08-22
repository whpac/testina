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

    // Didactic example showing the usage of the previous conversion function but,
    // for better performance, in a real application with a single input string
    // matched against many strings from a database, you will probably want to
    // pre-encode the input only once.
    //
    function levenshtein_utf8($s1, $s2)
    {
        $charMap = array();
        $s1 = utf8_to_extended_ascii($s1, $charMap);
        $s2 = utf8_to_extended_ascii($s2, $charMap);
    
        return levenshtein($s1, $s2);
    }
}
?>