<?php
namespace Api\Formats;

use \Api\Resources\Resource;

class JsonFormatter extends Formatter {

    public function Format($obj, int $depth = 3): string{
        return $this->FormatResource($obj, $depth);
    }

    protected function FormatResource($obj, int $depth = 3): string{
        // Zwróć pusty ciąg znaków - aby nie pozostawić pustego pola
        if($depth <= -1) return '""';
        
        $out = '';
        
        if($obj instanceof Resource){
            // Nie zagłębiaj się i zwróć pusty obiekt
            if($depth <= 0) return '{}';
            
            try{
                $keys = $obj->GetDefaultKeys();

                $out = '{';

                // Używany do oddzielenia właściwości
                $add_comma = false;
                foreach($keys as $key){
                    if(!$obj->KeyExists($key)) continue;
                    try{
                        $k = strval($key);
                        $resource = $obj->$k();

                        if($add_comma) $out .= ',';
                        $add_comma = true;

                        // Dopisz parę klucz: wartość
                        $out .= '"'.$k.'":';
                        $out .= $this->FormatResource($resource, $depth - 1);
                    }catch(\Exception $e){ }
                }
                $out .= '}';
            }catch(\Exception $e){
                return '{}';
            }
        }else{
            if(is_array($obj)){
                if($depth <= 0) return '[]';
                $out = '[';

                $add_comma = false;
                foreach($obj as $item){
                    if($add_comma) $out .= ',';
                    $add_comma = true;

                    $out .= $this->FormatResource($item, $depth - 1);
                }

                $out .= ']';
            }else{
                $out = $this->FormatScalar($obj);
            }
        }
        return $out;
    }

    protected function FormatScalar($value): string{
        // Wypisz liczby i wartości logiczne bez cudzysłowów
        if(is_bool($value)){
            return $value ? 'true' : 'false';
        }elseif(is_null($value)){
            return 'null';
        }elseif(is_numeric($value)){
            return $value;
        }elseif(is_array($value)){
            return '[]';
        }elseif($value instanceof \DateTime){
            return '"'.$value->format('Y-m-d H:i:s').'"';
        }else{
            $v = $value;
            $v = str_replace("\\", "\\\\", $v);
            $v = str_replace('"', '\"', $v);
            $v = str_replace("\n", '\n', $v);
            $v = str_replace("\r", '\r', $v);
            $v = str_replace("\010", '\b', $v);
            $v = str_replace("\f", '\f', $v);
            $v = str_replace("\t", '\t', $v);
            return '"'.$v.'"';
        }
    }

    public function GetContentType(): string{
        return 'application/json';
    }
}
?>