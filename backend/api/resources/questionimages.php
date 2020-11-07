<?php
namespace Api\Resources;

use Api\Exceptions\ResourceNotFound;

define('QUESTION_IMAGES_DIRECTORY', 'question_images/');
class QuestionImages extends Collection {

    public function __construct(){
        parent::__construct([]);
    }

    public function GetKeys(): array{
        return [];
    }

    public function KeyExists($key_name): bool{
        return true;
    }

    public function __call($image_id, $args){
        $filename = \Entities\Question::GetImageFileNameById($image_id);

        if(!file_exists(QUESTION_IMAGES_DIRECTORY.$filename)){
            throw new ResourceNotFound('Nie znaleziono obrazka '.$image_id);
        }

        $content = file_get_contents(QUESTION_IMAGES_DIRECTORY.$filename);
        return $content;
    }
}
?>