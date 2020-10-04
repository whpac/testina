<?php
namespace Api\Resources;

class SurveyResults extends Resource {
    protected $Questions;

    public function __construct($assignment){
        parent::__construct();

        $questions = [];

        $attempts = \Entities\Attempt::GetAttemptsByAssignment($assignment);
        foreach ($attempts as $attempt) {
            $user_answers = $attempt->GetUserAnswers()->AsArray();

            $visited_question_in_attempt = [];

            foreach($user_answers as $user_answer){
                $question = $user_answer->GetQuestion();

                $questions[$question->GetId()]['id'] = $question->GetId();
                $questions[$question->GetId()]['text'] = $question->GetText();

                if(!isset($visited_question_in_attempt[$question->GetId()]) || $visited_question_in_attempt[$question->GetId()] === false){
                    if(!isset($questions[$question->GetId()]['answer_count'])) $questions[$question->GetId()]['answer_count'] = 0;
                    $questions[$question->GetId()]['answer_count']++;
                }
                $visited_question_in_attempt[$question->GetId()] = true;

                $answer = '0';
                if($user_answer->IsOpenAnswer() && $question->GetType() != \Entities\Question::TYPE_RANGE){
                    $answer = $user_answer->GetSuppliedAnswer();
                    $questions[$question->GetId()]['user_supplied_answers'][] = $answer;
                }else{
                    $answer = '';
                    $answer_id = 0;

                    if($user_answer->IsOpenAnswer()){
                        $answer = $user_answer->GetSuppliedAnswer();
                        $answer_id = -100 - intval($answer);
                    }else{
                        $answer = $user_answer->GetAnswer();

                        if(is_scalar($answer)){
                            $answer_id = $answer;
                        }else{
                            $answer_id = $answer->GetId();
                        }
                    }

                    if(!isset($questions[$question->GetId()]['closed_answers'][$answer_id])){
                        $a = [
                            'id' => $answer_id,
                            'answer_count' => 0,
                            'text' => 'Nieznana'
                        ];

                        if($answer instanceof \Entities\Answer) $a['text'] = $answer->GetText();
                        else {
                            if($answer_id == -1) $a['text'] = 'Nie dotyczy';
                            if($answer_id <= -100) $a['text'] = $answer;
                        }

                        $questions[$question->GetId()]['closed_answers'][$answer_id] = $a;
                    }

                    $questions[$question->GetId()]['closed_answers'][$answer_id]['answer_count']++;
                }
            }
        }
        $this->Questions = $questions;
    }

    public function GetKeys(): array{
        return [
            'questions'
        ];
    }

    public function questions(): Collection{
        $out_questions = [];
        foreach($this->Questions as $question){
            $out_questions[$question['id']] = new QuestionResult($question);
        }
        $collection = new Collection($out_questions);
        $collection->SetContext($this->GetContext());
        return $collection;
    }
}

class QuestionResult extends Resource {
    protected $Data;

    public function __construct($data){
        parent::__construct();

        $this->Data = $data;
    }

    public function GetKeys(): array{
        return [
            'id',
            'text',
            'answer_count',
            'user_supplied_answers',
            'closed_answers'
        ];
    }

    public function id(): int{
        return $this->Data['id'];
    }

    public function text(): string{
        return $this->Data['text'];
    }

    public function answer_count(): int{
        return $this->Data['answer_count'];
    }

    public function user_supplied_answers(): array{
        $a = $this->Data['user_supplied_answers'];
        if(is_null($a)) $a = [];
        return $a;
    }

    public function closed_answers(): array{
        if(!is_array($this->Data['closed_answers'])) return [];
        $answers = [];

        foreach ($this->Data['closed_answers'] as $answer) {
            $a = new ClosedAnswerResult($answer);
            $a->SetContext($this->GetContext());
            $answers[] = $a;
        }

        return $answers;
    }
}

class ClosedAnswerResult extends Resource{
    protected $Data;

    public function __construct($data){
        parent::__construct();

        $this->Data = $data;
    }

    public function GetKeys(): array{
        return [
            'id',
            'text',
            'answer_count'
        ];
    }

    public function id(): int{
        return $this->Data['id'];
    }

    public function text(): string{
        return $this->Data['text'];
    }

    public function answer_count(): int{
        return $this->Data['answer_count'];
    }
}
?>