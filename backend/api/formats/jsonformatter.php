<?php
namespace Api\Formats;

use \Api\Resources\Resource;

class JsonFormatter extends Formatter {

    public /* string */ function FormatResource(Resource $obj, /* int */ $depth = 3){
        // Return empty string - not to have an empty field
        if($depth <= -1) return '""';
        
        $out = '';

        // If the value is array, parse it as an object
        $value = $obj->GetValue();
        if(!$obj->IsValueResource()){
            // Don't go deeper and return an empty object
            if($depth <= 0) return '{}';
            $out .= '{';

            // Used to separate properties
            $add_comma = false;
            foreach($value as $key => $resource){
                if($add_comma) $out .= ',';
                $add_comma = true;

                // Append the key: value pair
                $out .= '"'.$key.'":';
                $out .= $this->FormatResource($resource, $depth - 1);
            }
            $out .= '}';
        }else{
            if(is_array($value)){
                $out = '[';

                $add_comma = false;
                foreach($value as $item){
                    if($add_comma) $out .= ',';
                    $add_comma = true;

                    $out .= $this->FormatScalar($item);
                }

                $out .= ']';
            }else{
                $out = $this->FormatScalar($value);
            }
        }
        return $out;
    }

    protected /* string */ function FormatScalar($value){
        // Print numbers and bools without quotes
        if(is_bool($value)){
            return $value ? 'true' : 'false';
        }elseif(is_null($value)){
            return 'null';
        }elseif(is_numeric($value)){
            return $value;
        }elseif(is_array($value)){
            return '[]';
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

    public /* string */ function GetContentType(){
        return 'application/json';
    }
}
?>