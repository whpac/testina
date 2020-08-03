<?php
namespace Api\Resources;

use Api\Context;
use Api\Exceptions;

/**
 * Reprezentacja zasobu API
 */
abstract class Resource {
    private $Context;
    private $CreationArg;

    public function __construct($arg = null){
        $this->CreationArg = $arg;
    }

    /**
     * Zwraca argument przekazany do konstruktora
     * @deprecated
     */
    protected function GetConstructorArgument(){
        return $this->CreationArg;
    }

    /**
     * Zwraca tablicę nazw wszystkich pól w zasobie
     */
    public function GetKeys(): array{
        return [];
    }

    /**
     * Sprawdza, czy pole o podanej nazwie istnieje
     * @param $key_name Nazwa pola
     */
    public function KeyExists($key_name): bool{
        return method_exists($this, $key_name);
    }

    /**
     * Ustawia kontekst, związany z bieżącym stanem API i zalogowanym użytkownikiem
     * @param $context Nowy kontekst
     */
    public function SetContext(?Context $context){
        $this->Context = $context;
    }

    /**
     * Zwraca kontekst, związany z bieżącym stanem API i zalogowanym użytkownikiem
     */
    protected function GetContext(){
        return $this->Context;
    }

    /**
     * Obsługuje żądanie utworzenia podzasobu
     * @param $source Dane pochodzące z żądania
     */
    public function CreateSubResource(/* object */ $source){
        throw new Exceptions\MethodNotAllowed('POST');
    }

    /**
     * Obsługuje żądanie zaktualizowania zasobu
     * @param $source Dane pochodzące z żądania
     */
    public function Update(/* object */ $source){
        throw new Exceptions\MethodNotAllowed('PUT');
    }

    /**
     * Obsługuje żądanie usunięcia zasobu
     */
    public function Delete(){
        throw new Exceptions\MethodNotAllowed('DELETE');
    }
}
?>