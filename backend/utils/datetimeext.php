<?php
namespace Utils;

class DateTimeExt {

    /* Nieużywane przynajmniej od 14.08.
    public static function createFromFormat($format, $string){
        return new self(\DateTime::createFromFormat($format, $string)->format(\DateTime::ATOM));
    }

    public function GetIntervalInSeconds(){
        $time_limit = $this;

        $hrs = $time_limit->format('H');
        $mins = $time_limit->format('i');
        $secs = $time_limit->format('s');

        if($time_limit->format('Y') >= 1000){
            // $this is an absolute date
            $time_limit = (new \DateTime())->diff($this);

            $hrs = $time_limit->h;
            $mins = $time_limit->i;
            $secs = $time_limit->s;
        }

        if($time_limit->days !== false) $time_limit = $time_limit->days * 86400;
        else $time_limit = 0;
        
        $time_limit += $hrs * 3600 + $mins * 60 + $secs;

        return $time_limit;
    }

    public function AsString(){
        if($this->format('Y') < 1000){
            return $this->format(($this->format('H') > 0 ? 'H:' : '').'i:s');
        }
        return $this->format('d.m. H:i');
    }*/

    // Nieużywane przynajmniej od 14.08.
    // public static /* int */ function DiffInSeconds(\DateTime $dt, \DateTime $reference_dt = null){
    //     if($reference_dt == null) $reference_dt = new \DateTime();

    //     $diff = $reference_dt->diff($dt);

    //     $seconds_diff = $diff->days * 24;
    //     $seconds_diff += $diff->h;
    //     $seconds_diff *= 60;
    //     $seconds_diff += $diff->i;
    //     $seconds_diff *= 60;
    //     $seconds_diff += $diff->s;

    //     if($diff->invert == 1) $seconds_diff *= -1;

    //     return $seconds_diff;
    // }

    // public static /* string */ function SecondsToTime(/* int */ $seconds){
    //     $secs = $seconds % 60;
    //     $seconds = ($seconds - $secs) / 60;

    //     $mins = $seconds % 60;
    //     $hrs = ($seconds - $mins) / 60;

    //     if($secs < 10) $secs = '0'.$secs;
    //     if($mins < 10 && $hrs != 0) $mins = '0'.$mins;

    //     return ($hrs > 0 ? $hrs.':' : '').$mins.':'.$secs;
    // }
}
?>