<?php
namespace Database\Translators;

use Database\Entities\Condition;
use Log\Logger;
use Log\LogChannels;
use Utils\ArrayUtils;

class MySQLTranslator implements Translator {

    public static function TranslateQuery($query){
        switch($query->GetType()){
            case 'SELECT':
                return self::TranslateSelect($query);
            break;
            case 'INSERT':
                return self::TranslateInsert($query);
            break;
            case 'REPLACE':
                return self::TranslateReplace($query);
            break;
            case 'UPDATE':
                return self::TranslateUpdate($query);
            break;
            case 'DELETE':
                return self::TranslateDelete($query);
            break;
            default:
                Logger::Log('Otrzymano zapytanie nieznanego typu: '.$query->GetType().'.', LogChannels::DATABASE);
                throw new \Exception('Otrzymano zapytanie nieznanego typu.');
            break;
        }
    }

    static function TranslateSelect($query){
        $columns = '';
        if(count($query->columns) > 0){
            $columns = ArrayUtils::QuoteEachString($query->columns, '`');
            $columns = ArrayUtils::ArrayToList($columns);
        }else{
            $columns = '*';
        }

        $table = $query->table;
        $where = $query->where;
        $order_by = $query->order_by;
        $limit = $query->limit;
        $offset = $query->offset;

        if($where instanceof Condition)
            $where = $where->Parse();

        if(is_array($order_by))
            $order_by = ArrayUtils::ArrayToList($order_by);

        $query_text = '';
        $query_text .= 'SELECT '.$columns;
        if(!is_null($table)) $query_text .= ' FROM '.$table;
        if(!empty($where)) $query_text .= ' WHERE '.$where;
        if(!empty($order_by)) $query_text .= ' ORDER BY '.$order_by;
        if(!is_null($limit)) $query_text .= ' LIMIT '.$limit;
        if(!is_null($offset)) $query_text .= ' OFFSET '.$offset;
        return $query_text;
    }

    static function TranslateInsert($query){
        $percent_function = false;

        $table = $query->table;

        $columns = '';
        if(!is_null($query->columns)){
            $columns = ArrayUtils::QuoteEachString($query->columns, '`');
            $columns = ' ('.ArrayUtils::ArrayToList($columns).')';
        }
        $values = ArrayUtils::QuoteEachString($query->values, '"');
        $values = '('.ArrayUtils::ArrayToList($values).')';

        $query_text = '';
        $query_text .= 'INSERT INTO '.$table;
        $query_text .= $columns;
        $query_text .= ' VALUES '.$values;
        return $query_text;
    }

    static function TranslateReplace($query){
        $percent_function = false;

        $table = $query->table;

        $columns = '';
        if(!is_null($query->columns)){
            $columns = ArrayUtils::QuoteEachString($query->columns, '`');
            $columns = ' ('.ArrayUtils::ArrayToList($columns).')';
        }
        $values = ArrayUtils::QuoteEachString($query->values, '"');
        $values = '('.ArrayUtils::ArrayToList($values).')';

        $query_text = '';
        $query_text .= 'REPLACE INTO '.$table;
        $query_text .= $columns;
        $query_text .= ' VALUES '.$values;
        return $query_text;
    }

    static function TranslateUpdate($query){
        $table = $query->table;

        $values = '';
        for($i = 0; $i < count($query->set); $i++){
            $kvp = $query->set[$i];

            if($i > 0) $values .= ',';
            $values .= ' `'.$kvp[0].'` = ';

            if(is_numeric($kvp[1])) $values .= $kvp[1];
            else $values .= '"'.addslashes($kvp[1]).'"';
        }

        $where = $query->where;
        if($where instanceof Condition)
            $where = $where->Parse();

        $query_text = 'UPDATE '.$table.' SET'.$values.' WHERE '.$where;

        return $query_text;
    }

    static function TranslateDelete($query){
        $table = $query->table;

        $where = $query->where;
        if($where instanceof Condition)
            $where = $where->Parse();

        $query_text = 'DELETE FROM '.$table.' WHERE '.$where;

        return $query_text;
    }
}
?>