<?php
namespace Api\Formats;

use \Api\Resources\Resource;

class JsonFormatter extends Formatter {

    public /* string */ function FormatObject(Resource $obj, /* int */ $depth = 3){
        // Return empty string - not to have an empty field
        if($depth <= -1) return '""';
        
        $out = '';

        // If the value is array, parse it as an object
        $value = $obj->GetValue();
        if(is_array($value)){
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
                $out .= $this->FormatObject($resource, $depth - 1);
            }
            $out .= '}';
        }else{
            // Print numbers and bools without quotes
            if(is_bool($value)){
                $out = $value ? 'true' : 'false';
            }elseif(is_numeric($value)){
                $out = $value;
            }else{
                $v = addslashes($value);
                $v = str_replace("\n", '\n', $v);
                $v = str_replace("\r", '\r', $v);
                $v = str_replace("\010", '\b', $v);
                $v = str_replace("\f", '\f', $v);
                $v = str_replace("\t", '\t', $v);
                $out = '"'.$v.'"';
            }
        }
        return $out;
    }

    public /* string */ function GetContentType(){
        return 'application/json';
    }
}
?>