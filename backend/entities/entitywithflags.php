<?php
namespace Entities;

abstract class EntityWithFlags extends Entity {
    protected $flags;

    protected function OnPopulate(): void{
        parent::OnPopulate();

        settype($this->flags, 'int');
    }

    /**
     * Zwraca wszystkie flagi związane z encją
     */
    protected function GetFlags(): int{
        $this->FetchIfNeeded($this->flags);
        return $this->flags;
    }

    /**
     * Zwraca wartość flagi o podanej masce bitowej
     * @param $bitmask Maska bitowa flagi
     */
    protected function GetFlagValue($bitmask): int{
        $flags_int = $this->GetFlags();

        while(($bitmask & 1) == 0){
            $bitmask = $bitmask >> 1;
            $flags_int = $flags_int >> 1;
        }

        return $flags_int & $bitmask;
    }

    /**
     * Konwertuje tablicę flag na liczbę
     * @param $flags Tablica w formacie [maska bitowa => wartość flagi, maska => wartość, ...]
     * @param $original_flags Pierwotna wartość flag, którą należy zmodyfikować zgodnie z wartościami w $flags
     */
    protected static function ConvertFlagsToInt(array $flags, /* int */ $original_flags = 0): int{
        $flags_int = $original_flags;
        foreach($flags as $flag_bitmask => $flag_value){
            // Wyczyść poprzednią wartość flagi
            $flags_int = $flags_int & ~$flag_bitmask;

            // Oblicz pozycję najmłodszego bitu
            $bits_to_shift_val = 0;
            $bitmask = $flag_bitmask;
            while(($bitmask & 1) == 0){
                $bitmask = $bitmask >> 1;
                $bits_to_shift_val++;
            }

            // Jeśli flaga jest typu boolean, przelicz na liczbę
            if(is_bool($flag_value)) $flag_value = $flag_value ? 1 : 0;

            // Wyrównaj wartość flagi z jej lokalizacją
            $flag_value = $flag_value << $bits_to_shift_val;

            // Odrzuć bity, które wypadają poza maską bitową flagi
            $flag_value = $flag_value & $flag_bitmask;

            // Umieść wartość flagi między innymi
            $flags_int = $flags_int | $flag_value;
        }
        return $flags_int;
    }
}
?>