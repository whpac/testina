<?php
namespace Session\Key;

class KeyGenerator {

    public static function Generate(){
        if(!function_exists('random_bytes')) return self::RandomStr(64);
        try{
            $string = bin2hex(random_bytes(32));
        }catch(\Exception $e){
            $string = self::RandomStr(64);
        }
        return $string;
    }

    static function RandomStr($length){
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