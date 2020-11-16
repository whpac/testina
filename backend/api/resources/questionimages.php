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
        $image = \Entities\Question::GetImageById($image_id);
        $filename = $image[0];
        $type = $image[1];

        if(!file_exists(QUESTION_IMAGES_DIRECTORY.$filename)){
            throw new ResourceNotFound('Nie znaleziono obrazka '.$image_id);
        }

        OverrideReturnedMime($type);

        $content = file_get_contents(QUESTION_IMAGES_DIRECTORY.$filename);
        return $content;
    }
}
?>