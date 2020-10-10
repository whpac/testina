<?php
namespace Entities;

use Database\DatabaseManager;
use Log\Logger;
use Log\LogChannels;

abstract class Entity {
    protected /* (int|array) */ $_entity_descriptor;
    protected /* bool */ $_is_populated;

    /**
     * Tworzy obiekt na podstawie deskryptora (albo identyfikator, albo tablica właściwości)
     */
    public function __construct(/* (int|array) */ $entity_descriptor){
        $this->_entity_descriptor = $entity_descriptor;
        $this->_is_populated = false;

        if(static::IsDefault($entity_descriptor)){
            $this->PopulateDefaults();
            $this->_is_populated = true;
            return;
        }

        $row = [];
        if(is_numeric($entity_descriptor) || is_string($entity_descriptor)){
            if(static::AllowsDeferredFetch()){
                $this->id = $entity_descriptor;
                return;
            }else{
                $row = static::FetchEntity(static::GetTableName(), $entity_descriptor);
            }
        }elseif(is_array($entity_descriptor)){
            if(static::AllowsCreationFromArray()) $row = $entity_descriptor;
            else{
                Logger::Log('Próbowano utworzyć obiekt z tablicy.', LogChannels::APPLICATION_ERROR);
                throw new \Exception('Ten obiekt nie obsługuje tworzenia z tablicy');
            }
        }else{
            Logger::Log('Identyfikator obiektu jest błędnego typu: '.$entity_descriptor, LogChannels::VALIDATION_TYPE_MISMATCH);
            throw new \Exception('Identyfikator obiektu jest błędnego typu');
        }

        $this->PopulateProperties($row);
    }

    /**
     * Odczytuje z bazy danych tabelę właściwości odpowiadających identyfikatorowi
     */
    protected static /* mixed[] */ function FetchEntity(string $table_name, $entity_id){
        $result = DatabaseManager::GetProvider()
                ->Table($table_name)
                ->Select()
                ->Where('id', '=', $entity_id)
                ->Run();
        if($result->num_rows == 0){
            throw new \Exception('Obiekt o identyfikatorze '.$entity_id.' nie istnieje');
        }
        
        return $result->fetch_assoc();
    }

    /**
     * Przypisuje obiektowi właściwości zapisane w tablicy
     */
    protected /* void */ function PopulateProperties(array $prop_array){
        foreach($prop_array as $prop => $value){
            $this->$prop = $value;
        }
        $this->_is_populated = true;
        $this->OnPopulate();
    }

    /**
     * Jeżeli obiekt nie został wypełniony danymi i właściwość przekazana jako
     * parametr nie istnieje, pobierz dane z bazy
     */
    protected /* void */ function FetchIfNeeded(/* mixed */ $prop = null){
        if($this->_is_populated) return;
        if(isset($prop)) return;

        $row = static::FetchEntity(static::GetTableName(), $this->_entity_descriptor);
        $this->PopulateProperties($row);
    }

    /**
     * Tworzy stan domyślny (jeśli taki istnieje)
     */
    protected /* void */ function PopulateDefaults(){
        throw new \Exception('Obiekt tego typu nie przyjmuje wartości domyślnej');
    }

    /**
     * Funkcja do przesłonięcia w klasie potomnej, wywoływana po wypełnieniu obiektu danymi
     */
    protected /* void */ function OnPopulate(){

    }

    /**
     * Kontroluje, czy można utworzyć obiekt z tablicy
     * (zwiększa wydajność niektórych operacji, ale pozbawia kontroli nad integralnością)
     */
    protected static /* bool */ function AllowsCreationFromArray(){
        return true;
    }

    /**
     * Sprawdza, czy deskryptor obiektu odpowiada stanowi domyślnemu
     */
    protected static /* bool */ function IsDefault($descriptor){
        return false;
    }

    /**
     * Kontroluje, czy dane z bazy należy pobrać przy tworzeniu obiektu, czy można
     * poczekać, aż będą one potrzebne i dopiero wtedy wykonać zapytanie
     */
    protected static /* bool */ function AllowsDeferredFetch(){
        return false;
    }

    /**
     * Zwraca nazwę tablicy, zawierającej obiekty danego typu
     */
    protected abstract static /* string */ function GetTableName();
}
?>