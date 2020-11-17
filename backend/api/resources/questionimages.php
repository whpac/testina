<?php
namespace Api\Resources;

use Api\Exceptions\ResourceInaccessible;
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

        $question = \Entities\Question::GetQuestionByImageId($image_id);
        $test = $question->GetTest();

        $is_author = $test->GetAuthor()->GetId() == $this->GetContext()->GetUser()->GetId();
        if(!$is_author){
            $attempt = new \Entities\Attempt($this->GetAttemptId());

            $is_authorized = 
                $attempt->GetUser()->GetId() == $this->GetContext()->GetUser()->GetId()
                && $attempt->GetAssignment()->GetTest()->GetId() == $test->GetId();

            if(!$is_authorized){
                throw new ResourceInaccessible($image_id);
            }
        }

        if(!file_exists(QUESTION_IMAGES_DIRECTORY.$filename)){
            throw new ResourceNotFound('Nie znaleziono obrazka '.$image_id);
        }

        OverrideReturnedMime($type);

        $content = file_get_contents(QUESTION_IMAGES_DIRECTORY.$filename);
        return $content;
    }

    protected function GetAttemptId(){
        if(!isset($_GET['attempt'])) return -1;
        return intval($_GET['attempt']);
    }
}
?>