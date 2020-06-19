<?php
namespace Api\Resources;

use Api\Exceptions;

abstract class Resource {
    protected $SubResources = [];
    protected $Value = null;

    private $CreationArg = null;
    private $IsLoaded = false;

    public function __construct(/* mixed */ $args = null){
        $this->CreationArg = $args;
    }

    protected /* void */ function AddSubResource(/* string */ $name, Resource $resource){
        $this->SubResources[$name] = $resource;
        $this->Value = null;
    }

    protected /* void */ function SetValue(/* mixed */ $value){
        $this->Value = $value;
        $this->SubResources = [];
    }

    public /* Resource */ function GetSubResource(/* string */ $name, /* undefined yet */ $context = null){
        $this->LoadIfNeeded($name);

        if(!isset($this->SubResources[$name])){
            throw new Exceptions\ResourceNotFound($name);
        }

        $res = $this->SubResources[$name];
        $res->AssertAccessible($context);

        return $res;
    }

    public function GetAllSubResources(/* undefined yet */ $context = null){
        $this->LoadIfNeeded('');
        $res = [];

        foreach($this->SubResources as $key => $value){
            try{
                $value->AssertAccessible($context);
                $res[$key] = $value;
            }catch(Exceptions\ResourceInaccessible $e){

            }
        }

        return $res;
    }

    public /* mixed */ function GetValue(){
        if(is_null($this->Value)){
            // If value is null, this resource is a collection and thus should return all of its subresources
            return $this->GetAllSubResources();
        }else{
            $this->LoadIfNeeded('');
            return $this->Value;
        }
    }

    // Controls the lazy-loading of resources
    private function LoadIfNeeded(/* string */ $sub_resource_name){
        if($this->IsLoaded) return;
        if(isset($this->SubResources[$sub_resource_name])) return;

        $are_all_loaded = $this->LazyLoad($this->CreationArg, $sub_resource_name);
        if($are_all_loaded) $this->IsLoaded = true;
    }

    // Used in child class to set appropriate subresources on-demand
    // Returns true if there is nothing more to load
    // If the sub_resource_name is set to an empty string, it should load all subresources.
    // When requesting to load the value, the sub_resource_name is also going to be an empty string.
    protected /* bool */ function LazyLoad(/* mixed */ $args, /* string */ $sub_resource_name){
        return true;
    }

    protected /* object */ function GetConstructorArgument(){
        return $this->CreationArg;
    }

    public function AssertAccessible(/* undefined yet */ $context = null){
        // If inaccessible, throw an Exceptions\ResourceInaccessible exception
    }

    public function CreateSubResource(/* object */ $source, /* undefined yet */ $context = null){
        throw new Exceptions\MethodNotAllowed('POST');
    }

    public function Update(/* object */ $source, /* undefined yet */ $context = null){
        throw new Exceptions\MethodNotAllowed('PUT');
    }

    public function Delete(/* undefined yet */ $context = null){
        throw new Exceptions\MethodNotAllowed('DELETE');
    }
}
?>