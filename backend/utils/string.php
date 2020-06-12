<?php
namespace Utils;

class String {

    public static function Truncate($str, $length){
        if(strlen($str) <= $length) return $str;

        $sp_pos = strpos($str, ' ', $length);
        if($sp_pos === false) return $str;

        $str = substr($str, 0, $sp_pos);
        return $str.'…';
    }
}
?>