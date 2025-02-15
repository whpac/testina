<?php
namespace Api\Resources;

use Api\Schemas;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class Test extends Resource implements Schemas\Test{
    protected $Test;

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsString($data->name, 'name');
        TypeValidator::AssertIsNumeric($data->question_multiplier, 'question_multiplier');
        TypeValidator::AssertIsInt($data->time_limit, 'time_limit');
        ValueValidator::AssertIsNonNegative($data->question_multiplier, 'question_multiplier');
        ValueValidator::AssertIsNonNegative($data->time_limit, 'time_limit');

        $description = null;
        if(isset($data->description)){
            TypeValidator::AssertIsString($data->description, 'description');
            $description = $data->description;
        }
        $score_counting = null;
        if(isset($data->score_counting)){
            TypeValidator::AssertIsInt($data->score_counting, 'score_counting');
            ValueValidator::AssertIsInRange($data->score_counting, 0, 1, 'score_counting');
            $score_counting = $data->score_counting;
        }
        $final_title = null;
        if(isset($data->final_title)){
            TypeValidator::AssertIsString($data->final_title, 'final_title');
            $final_title = $data->final_title;
        }
        $final_text = null;
        if(isset($data->final_text)){
            TypeValidator::AssertIsString($data->final_text, 'final_text');
            $final_text = $data->final_text;
        }
        $hide_correct_answers = null;
        if(isset($data->do_hide_correct_answers)){
            TypeValidator::AssertIsBool($data->do_hide_correct_answers, 'do_hide_correct_answers');
            $hide_correct_answers = $data->do_hide_correct_answers;
        }
        $manual_marking = null;
        if(isset($data->is_marked_manually)){
            TypeValidator::AssertIsBool($data->is_marked_manually, 'is_marked_manually');
            $manual_marking = $data->is_marked_manually;
        }

        $res = $this->Test->Update($data->name, $data->question_multiplier, $data->time_limit, $description, $score_counting, $final_title, $final_text, $hide_correct_answers, $manual_marking);

        if(!$res) throw new \Exception('Nie udało się zaktualizować testu.');
    }

    public function Delete($source){
        $this->Test->Remove();
    }

    public function __construct($test){
        parent::__construct();

        if(is_null($test)) throw new \Exception('$test nie może być null');
        $this->Test = $test;
    }

    public function GetKeys(): array{
        $keys = [
            'id',
            'name',
            'author_id',
            'creation_date',
            'time_limit',
            'description',
            'type',
            'score_counting',
            'final_title',
            'final_text',
            'is_deleted',
            'do_hide_correct_answers',
            'is_marked_manually',
            'question_multiplier',
            'question_count'
        ];

        if($this->Test->GetAuthor()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $keys[] = 'questions';
            $keys[] = 'assignment_count';
            $keys[] = 'assignment_ids';

            if($this->Test->GetType() == \Entities\Test::TYPE_SURVEY){
                $keys[] = 'results';
                $keys[] = 'fill_count';
            }
        }

        return $keys;
    }

    public function GetDefaultKeys(): array{
        $keys = [
            'id',
            'name',
            'author_id',
            'creation_date',
            'time_limit',
            'description',
            'type',
            'score_counting',
            'final_title',
            'final_text',
            'is_deleted',
            'do_hide_correct_answers',
            'is_marked_manually',
            'question_multiplier',
            'question_count'
        ];

        if($this->Test->GetAuthor()->GetId() == $this->GetContext()->GetUser()->GetId()){
            $keys[] = 'questions';
            $keys[] = 'assignment_count';
            $keys[] = 'assignment_ids';

            if($this->Test->GetType() == \Entities\Test::TYPE_SURVEY){
                $keys[] = 'fill_count';
            }
        }

        return $keys;
    }

    public function id(): int{
        return $this->Test->GetId();
    }

    public function name(): string{
        return $this->Test->GetName();
    }

    public function author_id(): string{
        return $this->Test->GetAuthor()->GetId();
    }

    public function creation_date(): \DateTime{
        return $this->Test->GetCreationDate();
    }

    public function time_limit(): int{
        return $this->Test->GetTimeLimit();
    }

    public function description(): ?string{
        return $this->Test->GetDescription();
    }

    public function type(): int{
        return $this->Test->GetType();
    }

    public function score_counting(): int{
        return $this->Test->GetScoreCounting();
    }

    public function final_title(): string{
        return $this->Test->GetFinalTitle();
    }

    public function final_text(): string{
        return $this->Test->GetFinalText();
    }

    public function is_deleted(): bool{
        return $this->Test->IsDeleted();
    }

    public function do_hide_correct_answers(): bool{
        return $this->Test->GetDoHideCorrectAnswers();
    }

    public function is_marked_manually(): bool{
        return $this->Test->IsMarkedManually();
    }

    public function question_multiplier(): float{
        return $this->Test->GetQuestionMultiplier();
    }

    public function question_count(): int{
        return count($this->Test->GetQuestions());
    }

    public function questions(): ?Schemas\Collection{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $questions = $this->Test->GetQuestions();
        $out_questions = [];

        foreach($questions as $question){
            $out_questions[$question->GetId()] = new Question($question);
        }

        $collection = new QuestionCollection($out_questions, $this->Test);
        $collection->SetContext($this->GetContext());
        return $collection;
    }

    public function assignment_count(): ?int{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        return $this->Test->GetAssignmentCount();
    }

    public function assignment_ids(): ?array{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;

        $assignments = $this->Test->GetAssignments();
        $out_assignments = [];

        foreach($assignments as $assignment){
            $out_assignments[] = $assignment->GetId();
        }

        return $out_assignments;
    }

    public function results(): ?Schemas\SurveyResults{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        if($this->Test->GetType() != \Entities\Test::TYPE_SURVEY) return null;

        $assignments = $this->Test->GetAssignments();
        if(count($assignments) == 0) return null;

        $results = new SurveyResults($assignments[0]);
        $results->SetContext($this->GetContext());
        return $results;
    }

    public function fill_count(): ?int{
        if($this->Test->GetAuthor()->GetId() != $this->GetContext()->GetUser()->GetId()) return null;
        if($this->Test->GetType() != \Entities\Test::TYPE_SURVEY) return null;

        $assignments = $this->Test->GetAssignments();
        if(count($assignments) == 0) return 0;

        return count(\Entities\Attempt::GetAttemptsByAssignment($assignments[0]));
    }
}
?>