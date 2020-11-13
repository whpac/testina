<?php
namespace Api\Resources;

use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;
use Api\Exceptions\BadRequest;
use Api\Exceptions\ResourceInaccessible;

define('QUESTION_IMAGES_DIRECTORY', 'question_images/');
class QuestionImagesManager extends Resource {
    protected $Question;

    public function __construct($question){
        parent::__construct();

        $this->Question = $question;
    }

    public function CreateSubResource(/* mixed */ $source){
        if($this->GetContext()->GetUser()->GetId() != $this->Question->GetTest()->GetAuthor()->GetId())
            throw new ResourceInaccessible('Tylko autor pytania może doń dodawać obrazki.');

        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsString($source->type, 'type');
        TypeValidator::AssertIsString($source->content, 'content');

        if(substr($source->type, 0, 6) != 'image/'){
            throw new BadRequest('Plik musi być obrazem.');
        }

        $binary_content = base64_decode($source->content, true);
        if($binary_content === false){
            throw new BadRequest('Zawartość pliku z obrazem jest nieprawidłowa.');
        }

        $file_name = '';
        do {
            $file_name = self::GenerateFileName();
        }while(file_exists(QUESTION_IMAGES_DIRECTORY.$file_name));

        $fhandle = fopen(QUESTION_IMAGES_DIRECTORY.$file_name, 'w');
        fwrite($fhandle, $binary_content);
        fclose($fhandle);

        $image_id = $this->Question->AttachImage($file_name, $source->type);
        header('Content-Location: '.$image_id);
        return null;
    }

    public function Delete($source){
        if($this->GetContext()->GetUser()->GetId() != $this->Question->GetTest()->GetAuthor()->GetId())
            throw new ResourceInaccessible('Tylko autor pytania może zeń usuwać obrazki.');

        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsArray($source->ids, 'ids');
        foreach ($source->ids as $file_id) {
            TypeValidator::AssertIsInt($file_id, 'id');

            $file_name = \Entities\Question::GetImageFileNameById($file_id);
            if(file_exists(QUESTION_IMAGES_DIRECTORY.$file_name)){
                unlink(QUESTION_IMAGES_DIRECTORY.$file_name);
            }
            $this->Question->DetachImage($file_id);
        }
    }

    protected static function GenerateFileName(){
        $filename = dechex(time());
        $filename.= '_';
        $filename.= rand(1000, 9999);
        $filename.= '.img';
        return $filename;
    }
}
?>