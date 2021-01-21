<?php
namespace Api\Resources;

use Api\Exceptions;
use Api\Validation\TypeValidator;
use Api\Validation\ValueValidator;

class AttemptAnswers extends Resource {
    protected $Attempt;

    public function __construct($attempt){
        parent::__construct();

        $this->Attempt = $attempt;
    }

    public function CreateSubResource(/* object */ $source){
        TypeValidator::AssertIsObject($source);
        TypeValidator::AssertIsArray($source->questions, 'questions');

        // Sprawdź, czy użytkownik nie wysłał wcześniej odpowiedzi
        if($this->Attempt->GetUserAnswers()->Count() > 0){
            throw new Exceptions\BadRequest('W każdym podejściu można wysłać tylko jeden zestaw odpowiedzi.');
        }

        /**
         * Sprawdź, czy rozwiązanie nie wpłynęło po czasie
         * Pierwszeństwo ma termin określony w przypisaniu
         * Użytkownik ma dodatkowy 180-sekundowy bufor na nadesłanie rozwiązań
         */
        $assignment = $this->Attempt->GetAssignment();
        if($assignment->GetTimeLimit() < (new \DateTime('-180 seconds'))){
            throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
        }

        $test = $assignment->GetTest();
        if($test->HasTimeLimit()){
            $time_limit = $test->GetTimeLimit();
            $interval = new \DateInterval('PT'.$time_limit.'S');
            $time_limit = $assignment->GetTimeLimit()->add($interval);

            if($time_limit < new \DateTime('-180 seconds')){
                throw new Exceptions\BadRequest('Termin rozwiązania tego testu upłynął.');
            }
        }

        if($this->GetContext()->IsAuthorized() || $test->GetType() == \Entities\Test::TYPE_TEST){
            $user = $this->GetContext()->GetUser();

            // CountUserAttempts nie wlicza nieukończonych podejść
            if(
                (!$assignment->AreAttemptsUnlimited() &&
                $assignment->CountUserAttempts($user, true) > $assignment->GetAttemptLimit()) ||
                $test->IsDeleted()
            ){
                throw new Exceptions\BadRequest('Wykorzystał'.($this->GetContext()->GetUser()->IsFemale() ? 'a' : 'e').'ś już wszystkie podejścia.');
            }
        }

        $errors = 0;
        foreach($source->questions as $question_index => $question){
            TypeValidator::AssertIsBool($question->done, 'done');

            if($question->done){
                TypeValidator::AssertIsArray($question->answers, 'question.answers');
            }

            if($question->done && count($question->answers) != 0){
                TypeValidator::AssertIsInt($question->id, 'question.id');
                TypeValidator::AssertIsBool($question->is_open, 'question.is_open');

                foreach($question->answers as $answer){
                    try{
                        if(isset($answer->text)){
                            TypeValidator::AssertIsString($answer->text, 'answer.text');
                            
                            \Entities\UserAnswer::CreateOpenAnswer($this->Attempt, $question_index, new \Entities\Question($question->id), $answer->text);
                        }else{
                            TypeValidator::AssertIsInt($answer->id, 'answer.id');

                            if($answer->id >= 0){
                                \Entities\UserAnswer::Create($this->Attempt, new \Entities\Answer($answer->id), $question_index);
                            }else{
                                \Entities\UserAnswer::CreateSpecialAnswer($this->Attempt, $answer->id, $question_index, new \Entities\Question($question->id));
                            }
                        }
                    }catch(Exception $e){
                        $errors++;
                    }
                }
            }else{
                \Entities\UserAnswer::CreateNoAnswer($this->Attempt, $question_index, new \Entities\Question($question->id));
            }
        }

        if($errors > 0){
            $this->Attempt->Remove();
            throw new \Exception('Wystąpił błąd podczas zapisywania odpowiedzi do bazy danych.');
        }

        // Count score
        $user_answers = $this->Attempt->GetUserAnswers();
        $answered_questions = $user_answers->GetAnsweredQuestions();

        $score_got = 0;
        $score_max = 0;

        foreach($answered_questions as $question){
            $answer_sets = $user_answers->GetAnswersByQuestion($question);
            
            foreach($answer_sets as $answer_set){
                // answer_set = [answers, q_index]
                $current_got = null;
                if(!$test->IsMarkedManually()){
                    $current_got = $question->CountPoints($answer_set[0]);
                    $score_got += $current_got;
                }
                $score_max += $question->GetPoints();

                \Entities\UserAnswer::SaveScoreForQuestion($this->Attempt, $answer_set[1], $current_got);
            }
        }

        // Update attempt to reflect the score
        if($test->IsMarkedManually()){
            $this->Attempt->UpdateScore(null, $score_max);
        }else{
            $this->Attempt->UpdateScore($score_got, $score_max);
        }
        $this->Attempt->MarkAsFinished();
    }

    public function Update(/* mixed */ $data){
        TypeValidator::AssertIsObject($data);
        TypeValidator::AssertIsInt($data->question_index, 'question_index');
        TypeValidator::AssertIsNumeric($data->new_score, 'new_score');
        ValueValidator::AssertIsNonNegative($data->new_score);

        $res = \Entities\UserAnswer::SaveScoreForQuestion($this->Attempt, $data->question_index, $data->new_score);

        if(!$res) throw new \Exception('Nie udało się zaktualizować wyniku pytania');

        $user_answers = $this->Attempt->GetUserAnswers();
        $answered_questions = $user_answers->GetAnsweredQuestions();

        $score_got = 0;
        $score_max = 0;

        foreach($answered_questions as $question){
            $answer_sets = $user_answers->GetAnswersByQuestion($question);
            
            foreach($answer_sets as $answer_set){
                // answer_set = [answers, q_index]
                $score_max += $question->GetPoints();
                $got = \Entities\UserAnswer::GetScoreForAttemptAndQuestionIndex($this->Attempt, $answer_set[1]);

                if(is_null($got) || is_null($score_got)) $score_got = null;
                else $score_got += $got;
            }
        }

        $this->Attempt->UpdateScore($score_got, $score_max);
    }

    public function GetKeys(): array{
        if($this->GetContext()->GetUser()->GetId() != $this->Attempt->GetAssignment()->GetAssigningUser()->GetId()) return [];

        return [
            'get'
        ];
    }

    public function GetDefaultKeys(): array{
        return [];
    }

    public function get(){
        if($this->GetContext()->GetUser()->GetId() != $this->Attempt->GetAssignment()->GetAssigningUser()->GetId()) return null;

        $out_array = [];
        $user_answers = $this->Attempt->GetUserAnswers()->AsArray();

        foreach($user_answers as $user_answer){
            $out_array[$user_answer->GetQuestionIndex()]['question_id'] = $user_answer->GetQuestion()->GetId();
            $out_array[$user_answer->GetQuestionIndex()]['question_index'] = $user_answer->GetQuestionIndex();
            $out_array[$user_answer->GetQuestionIndex()]['score_got'] = $user_answer->GetScore();

            $answer_id = $user_answer->GetAnswer();
            if($answer_id instanceof \Entities\Answer) $answer_id = $answer_id->GetId();
            $out_array[$user_answer->GetQuestionIndex()]['answer_ids'][] = $answer_id;
            $out_array[$user_answer->GetQuestionIndex()]['supplied_answer'] = $user_answer->GetSuppliedAnswer();
            $out_array[$user_answer->GetQuestionIndex()]['is_open'] = $user_answer->IsOpenAnswer();
        }

        $resources = [];
        foreach($out_array as $q){
            $resources[] = new AttemptAnswersQuestion($q);
        }

        $coll = new Collection($resources);
        $coll->SetContext($this->GetContext());
        return $coll;
    }
}

class AttemptAnswersQuestion extends Resource {
    protected $Data;

    public function __construct($data){
        parent::__construct();

        $this->Data = $data;
    }

    public function GetKeys(): array{
        return [
            'question_id',
            'question_index',
            'answer_ids',
            'supplied_answer',
            'is_open',
            'score_got'
        ];
    }

    public function question_id(): int{
        return $this->Data['question_id'];
    }

    public function question_index(): int{
        return $this->Data['question_index'];
    }

    public function answer_ids(): array{
        return $this->Data['answer_ids'];
    }

    public function supplied_answer(): string{
        return $this->Data['supplied_answer'];
    }

    public function is_open(): bool{
        return $this->Data['is_open'];
    }

    public function score_got(): ?float{
        return $this->Data['score_got'];
    }
}
?>