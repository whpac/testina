<?php
namespace Api\Resources;

use Api\Context;
use Api\Exceptions;

abstract class Resource {
    protected $SubResources = [];
    protected $Value = null;
    protected $IsValueResource = false;

    private $CreationArg = null;
    private $IsLoaded = false;
    private $Context;

    public function __construct(/* mixed */ $args = null){
        $this->CreationArg = $args;
    }

    public function SetContext(?Context $context){
        $this->Context = $context;
    }

    protected function GetContext(){
        return $this->Context;
    }

    protected /* void */ function AddSubResource(/* string */ $name, Resource $resource){
        $this->SubResources[$name] = $resource;
        $this->Value = null;
    }

    protected /* void */ function SetValue(/* mixed */ $value){
        $this->Value = $value;
        $this->SubResources = [];
    }

    public /* bool */ function IsValueResource(){
        return $this->IsValueResource;
    }

    public /* Resource */ function GetSubResource(/* string */ $name){
        $this->LoadIfNeeded($name);

        if(!isset($this->SubResources[$name])){
            throw new Exceptions\ResourceNotFound($name);
        }

        $res = $this->SubResources[$name];
        $res->SetContext($this->Context);
        $res->AssertAccessible();

        return $res;
    }

    public function GetAllSubResources(){
        $this->LoadIfNeeded('');
        $res = [];

        foreach($this->SubResources as $key => $value){
            try{
                $value->SetContext($this->Context);
                $value->AssertAccessible();
                $res[$key] = $value;
            }catch(Exceptions\ResourceInaccessible $e){

            }
        }

        return $res;
    }

    public /* mixed */ function GetValue(){
        if($this->IsValueResource){
            $this->LoadIfNeeded('');
            $this->AssertAccessible();
            return $this->Value;
        }else{
            // This resource is a collection and thus should return all of its subresources
            return $this->GetAllSubResources();
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

    public function AssertAccessible(){
        // If inaccessible, throw an Exceptions\ResourceInaccessible exception
    }

    public function CreateSubResource(/* object */ $source){
        throw new Exceptions\MethodNotAllowed('POST');
    }

    public function Update(/* object */ $source){
        throw new Exceptions\MethodNotAllowed('PUT');
    }

    public function Delete(){
        throw new Exceptions\MethodNotAllowed('DELETE');
    }

    public function GetKeys(): array{
        return [];
    }

    public function KeyExists($key_name): bool{
        return method_exists($this, $key_name);
    }
}
?>