<?php
namespace Api;

abstract class Resource {
    protected $SubResources = [];
    protected $Value = null;

    protected function AddSubResource(/* string */ $name, Resource $resource){
        $this->SubResources[$name] = $resource;
        $this->Value = null;
    }

    protected function SetValue(/* mixed */ $value){
        $this->Value = $value;
        $this->SubResources = [];
    }

    public function GetSubResource(/* string */ $name, /* undefined yet */ $context = null){
        if(!isset($this->SubResources[$name])){
            throw new Exceptions\ResourceNotFound($name);
        }

        $res = $this->SubResources[$name];
        $res->AssertAccessible($context);

        return $res;
    }

    public function GetValue(){
        if(is_null($this->Value)){
            // If value is null, this resource is a collection and thus should return all of its subresources
            return $this->SubResources;
        }else{
            return $this->Value;
        }
    }

    public function AssertAccessible(/* undefined yet */ $context = null){
        // If inaccessible, throw an Exceptions\ResourceInaccessible exception
    }
}
?>