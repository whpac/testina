<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class Question extends Resource implements Schemas\Question{
    protected $Question;

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsInt($data->max_typos, 'max_typos');
        TypeValidator::AssertIsNumeric($data->points, 'points');
        TypeValidator::AssertIsInt($data->points_counting, 'points_counting');
        TypeValidator::AssertIsString($data->text, 'text');
        TypeValidator::AssertIsInt($data->type, 'type');
        ValueValidator::AssertIsNonNegative($data->max_typos, 'max_typos');
        ValueValidator::AssertIsNonNegative($data->points, 'points');
        ValueValidator::AssertIsInRange($data->points_counting, 0, 2, 'points_counting');
        ValueValidator::AssertIsInRange($data->type, 0, 3, 'type');

        $footer = null;
        if(isset($data->footer) && !is_null($data->footer)){
            TypeValidator::AssertIsString($data->footer, 'footer');
            $footer = $data->footer;
        }
        $order = null;
        if(isset($data->order) && !is_null($data->order)){
            TypeValidator::AssertIsInt($data->order, 'order');
            ValueValidator::AssertIsNonNegative($data->order, 'order');
            $order = $data->order;
        }

        $flags = [];
        if(isset($data->is_optional) && !is_null($data->is_optional)){
            TypeValidator::AssertIsBool($data->is_optional, 'is_optional');
            $flags[\Entities\Question::FLAG_OPTIONAL] = $data->is_optional;
        }
        if(isset($data->has_na) && !is_null($data->has_na)){
            TypeValidator::AssertIsBool($data->has_na, 'has_na');
            $flags[\Entities\Question::FLAG_NON_APPLICABLE] = $data->has_na;
        }
        if(isset($data->has_other) && !is_null($data->has_other)){
            TypeValidator::AssertIsBool($data->has_other, 'has_other');
            $flags[\Entities\Question::FLAG_OTHER] = $data->has_other;
        }

        $res = $this->Question->Update($data->text, $data->type, $data->points, $data->points_counting, $data->max_typos, $footer, $order, $flags);

        if(!$res) throw new \Exception('Nie udało się zaktualizować pytania.');
    }

    public function Delete($source){
        $res = $this->Question->Remove();

        if(!$res) throw new \Exception('Nie udało się usunąć pytania.');
    }

    public function __construct($question){
        parent::__construct();

        if(is_null($question)) throw new \Exception('$question nie może być null.');
        $this->Question = $question;
    }

    public function GetKeys(): array{
        return [
            'id',
            'text',
            'type',
            'points',
            'points_counting',
            'max_typos',
            'footer',
            'order',
            'is_optional',
            'has_na',
            'has_other',
            'answer_count',
            'answers',
            'image_ids',
            'images'
        ];
    }

    public function GetDefaultKeys(): array{
        return [
            'id',
            'text',
            'type',
            'points',
            'points_counting',
            'max_typos',
            'footer',
            'order',
            'is_optional',
            'has_na',
            'has_other',
            'answer_count',
            'answers',
            'image_ids'
        ];
    }

    public function id(): int{
        return $this->Question->GetId();
    }

    public function text(): string{
        return $this->Question->GetText();
    }

    public function type(): int{
        return $this->Question->GetType();
    }

    public function points(): float{
        return $this->Question->GetPoints();
    }

    public function points_counting(): int{
        return $this->Question->GetPointsCounting();
    }

    public function max_typos(): int{
        return $this->Question->GetMaxNumberOfTypos();
    }

    public function footer(): ?string{
        return $this->Question->GetFooter();
    }

    public function order(): int{
        return $this->Question->GetOrder();
    }

    public function is_optional(): bool{
        return $this->Question->IsOptional();
    }

    public function has_na(): bool{
        return $this->Question->HasNonApplicableAnswer();
    }

    public function has_other(): bool{
        return $this->Question->HasOtherAnswer();
    }

    public function answer_count(): int{
        return count($this->Question->GetAnswers());
    }

    public function answers(): Schemas\Collection{
        $answers = $this->Question->GetAnswers();
        $out_answers = [];

        foreach($answers as $answer){
            $out_answers[$answer->GetId()] = new Answer($answer);
        }

        $collection = new AnswerCollection($out_answers, $this->Question);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function image_ids(): array{
        return $this->Question->GetImageIds();
    }

    public function images(): QuestionImagesManager{
        $img_mgr = new QuestionImagesManager($this->Question);
        $img_mgr->SetContext($this->GetContext());
        return $img_mgr;
    }
}
?>