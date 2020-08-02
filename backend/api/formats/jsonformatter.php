<?php
namespace Api\Formats;

use \Api\Resources\Resource;

class JsonFormatter extends Formatter {

    public function FormatResource($obj, int $depth = 3): string{
        // Return empty string - not to have an empty field
        if($depth <= -1) return '""';
        
        $out = '';

        if($obj instanceof Resource){
            // Don't go deeper and return an empty object
            if($depth <= 0) return '{}';

            $keys = $obj->GetKeys();

            $out = '{';

            // Used to separate properties
            $add_comma = false;
            foreach($keys as $key){
                if(!method_exists($obj, $key)) continue;
                $resource = $obj->$key();

                if($add_comma) $out .= ',';
                $add_comma = true;

                // Append the key: value pair
                $out .= '"'.$key.'":';
                $out .= $this->FormatResource($resource, $depth - 1);
            }
            $out .= '}';
        }else{
            if(is_array($obj)){
                if($depth <= 0) return '{}';
                $out = '{';

                $add_comma = false;
                foreach($obj as $key => $item){
                    if($add_comma) $out .= ',';
                    $add_comma = true;

                    $out .= '"'.$key.'":';
                    $out .= $this->FormatResource($item, $depth - 1);
                }

                $out .= '}';
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
            return $value->format('Y-m-d H:i:s');
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