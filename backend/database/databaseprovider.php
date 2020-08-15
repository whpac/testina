<?php
namespace Database;

/**
 * Ogólny interfejs opisujący dostawcę bazy danych
 */
interface DatabaseProvider {

    public function Connect();
    public function Close();
    public function GetError();
    public function Query($query);
}
?>