import Answer from './answer';
import Question from './question';

export default class QuestionWithUserAnswers {
    protected Question: Question;
    protected Answers: Answer[];
    protected IsAnswerSelected: boolean[];
    protected IsDone: boolean;
    protected Score: number | undefined;

    constructor(question: Question){
        this.Question = question;
        this.Answers = [];
        this.IsAnswerSelected = [];
        this.IsDone = false;
    }

    static FromArray(questions: Question[]){
        let result: QuestionWithUserAnswers[] = [];
        for(let question of questions){
            result.push(new QuestionWithUserAnswers(question));
        }
        return result;
    }

    public GetQuestion(){
        return this.Question;
    }

    public SetAnswers(answers: Answer[]){
        this.Answers = answers;
        this.DeselectAllAnswers();
    }

    public GetAnswers(){
        return this.Answers;
    }

    public GetSelectedAnswers(){
        let selected: Answer[] = [];
        for(let i = 0; i < this.Answers.length; i++){
            if(this.IsAnswerSelected[i]) selected.push(this.Answers[i]);
        }
        return selected;
    }

    public DeselectAllAnswers(){
        for(let i = 0; i < this.Answers.length; i++){
            this.IsAnswerSelected[i] = false;
        }
    }

    public SetAnswerSelection(index: number, is_selected: boolean){
        this.IsAnswerSelected[index] = is_selected;
    }

    public GetAnswerSelection(index: number){
        return this.IsAnswerSelected[index] ?? false;
    }

    public ToggleAnswerSelection(index: number){
        this.IsAnswerSelected[index] = !this.IsAnswerSelected[index];
    }

    public MarkAsDone(){
        this.IsDone = true;
    }

    public GetIsDone(){
        return this.IsDone;
    }

    public async CountPoints(){
        if(!this.IsDone) return 0;
        if(this.Score !== undefined) return this.Score;

        switch(await this.Question.GetPointsCounting()){
            case Question.COUNTING_BINARY:
                let number_of_correct_choices = 0;
                for(let i = 0; i < this.IsAnswerSelected.length; i++){
                    if(this.IsAnswerSelected[i] == await this.Answers[i].IsCorrect()){
                        number_of_correct_choices++;
                    }
                }

                if(number_of_correct_choices == this.Answers.length){
                    this.Score = await this.Question.GetPoints();
                }else{
                    this.Score = 0;
                }
                return this.Score;
            break;
            
            case Question.COUNTING_LINEAR:
                let number_of_wrong_choices = 0;
                let number_of_correct_answers = 0;
                for(let i = 0; i < this.IsAnswerSelected.length; i++){
                    if(this.IsAnswerSelected[i] != await this.Answers[i].IsCorrect()){
                        number_of_wrong_choices++;
                    }
                    if(await this.Answers[i].IsCorrect()){
                        number_of_correct_answers++;
                    }
                }

                let correct_factor = 1 - (number_of_wrong_choices / number_of_correct_answers);
                if(correct_factor < 0) correct_factor = 0;
                this.Score = correct_factor * (await this.Question.GetPoints());
                return this.Score;
            break;

            default:
                return 0;
        }
    }
}