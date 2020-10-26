<?php
namespace Api\Resources;

use Api\Exceptions\ResourceNotFound;

class RootAttempts extends Collection {

    public function __construct(){
        parent::__construct([]);
    }

    public function GetKeys(): array{
        return [];
    }

    public function KeyExists($key_name): bool{
        return true;
    }

    public function __call($name, $args){
        $successful = false;
        $attempt = null;
        try{
            $attempt = new \Entities\Attempt($name);
            $successful = true;

            if($attempt->GetAssignment()->GetAssigningUser()->GetId() != $this->GetContext()->GetUser()->GetId())
                $successful = false;
        }catch(\Exception $e){

        }
        if(!$successful) throw new ResourceNotFound('Podejście nie jest dostępne');

        $resource = new Attempt($attempt);
        $resource->SetContext($this->GetContext());
        return $resource;
    }
}
?>