<?php
namespace Entities;

class UserAnswerCollection {
    protected /* UserAnswer[] */ $user_answers;
    protected /* int[][] */ $answers_by_index;
    protected /* int[][] */ $indices_by_question;

    public function __construct(array $user_answers = []){
        $this->user_answers = $user_answers;
        $this->answers_by_index = null;
        $this->indices_by_question = null;
    }

    public /* void */ function Add(UserAnswer $user_answer){
        $this->user_answers[] = $user_answer;
    }

    public /* UserAnswer[] */ function AsArray(){
        return $this->user_answers;
    }

    public /* number */ function Count(){
        return count($this->user_answers);
    }

    public /* void */ function GroupByQuestionIndex(){
        $this->answers_by_index = [];

        foreach($this->user_answers as $i => $user_answer){
            if(!isset($this->answers_by_index[$user_answer->GetQuestionIndex()]))
            $this->answers_by_index[$user_answer->GetQuestionIndex()] = [];

            $this->answers_by_index[$user_answer->GetQuestionIndex()][] = $i;
        }
    }

    public /* void */ function GroupIndicesByQuestion(){
        if(is_null($this->answers_by_index)) $this->GroupByQuestionIndex();

        $this->indices_by_question = [];

        foreach($this->answers_by_index as $index => $answers){
            $question_id = $this->user_answers[$answers[0]]->GetQuestion()->GetId();

            if(!isset($this->indices_by_question[$question_id]))
            $this->indices_by_question[$question_id] = [];

            $this->indices_by_question[$question_id][] = $index;
        }
    }

    public /* UserAnswer[] */ function GetAnswersByQuestionIndex(/* int */ $index){
        if(is_null($this->answers_by_index)) $this->GroupByQuestionIndex();

        if(!isset($this->answers_by_index[$index])) return [];

        $res = [];
        $answers = $this->answers_by_index[$index];
        foreach($answers as $key => $answer){
            $res[$key] = $this->user_answers[$answer];
        }

        return $res;
    }

    public /* UserAnswer[][] */ function GetAnswersByQuestion(Question $question){
        if(is_null($this->indices_by_question)) $this->GroupIndicesByQuestion();

        if(!isset($this->indices_by_question[$question->GetId()])) return [];
        $indices = $this->indices_by_question[$question->GetId()];
        $answers = [];

        foreach($indices as $index){
            $answers[] = $this->GetAnswersByQuestionIndex($index);
        }

        return $answers;
    }

    public /* Question[] */ function GetAnsweredQuestions(){
        if(is_null($this->indices_by_question)) $this->GroupIndicesByQuestion();
        
        $questions = [];
        foreach($this->indices_by_question as $qid => $val){
            $questions[] = new Question($qid);
        }
        return $questions;
    }
}
?>