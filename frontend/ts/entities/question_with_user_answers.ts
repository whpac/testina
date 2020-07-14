import Answer from './answer';
import Question from './question';

/** Klasa reprezentująca pytanie z odpowiedziami użytkownika */
export default class QuestionWithUserAnswers {
    /** Pytanie */
    protected Question: Question;
    /** Odpowiedzi do pytania */
    protected Answers: Answer[];
    /** Czy dana odpowiedź została zaznaczona */
    protected IsAnswerSelected: boolean[];
    /** Czy rozwiązywanie pytania zostało ukończone */
    protected IsDone: boolean;
    /** Zdobyty wynik punktowy za pytanie */
    protected Score: number | undefined;

    /**
     * Klasa reprezentująca pytanie z odpowiedziami użytkownika
     * @param question Pytanie, do którego odpowiedzi mają być przechowywane
     */
    constructor(question: Question){
        this.Question = question;
        this.Answers = [];
        this.IsAnswerSelected = [];
        this.IsDone = false;
    }

    /**
     * Tworzy tablicę QuestionWithUserAnswers[] z tablicy Question[]
     * @param questions Wejściowa tablica
     */
    static FromArray(questions: Question[]){
        let result: QuestionWithUserAnswers[] = [];
        for(let question of questions){
            result.push(new QuestionWithUserAnswers(question));
        }
        return result;
    }

    /** Zwraca pytanie */
    public GetQuestion(){
        return this.Question;
    }

    /**
     * Ustawia tablicę odpowiedzi i oznacza je wszystkie jako niezaznaczone
     * @param answers Tablica odpowiedzi
     */
    public SetAnswers(answers: Answer[]){
        this.Answers = answers;
        this.DeselectAllAnswers();
    }

    /** Zwraca odpowiedzi */
    public GetAnswers(){
        return this.Answers;
    }

    /** Zwraca zaznaczone odpowiedzi */
    public GetSelectedAnswers(){
        let selected: Answer[] = [];
        for(let i = 0; i < this.Answers.length; i++){
            if(this.IsAnswerSelected[i]) selected.push(this.Answers[i]);
        }
        return selected;
    }

    /** Oznacza wszystkie odpowiedzi jako niezaznaczone */
    public DeselectAllAnswers(){
        for(let i = 0; i < this.Answers.length; i++){
            this.IsAnswerSelected[i] = false;
        }
    }

    /**
     * Oznacza daną odpowiedź jako zaznaczoną bądź niezaznaczoną
     * @param index Numer odpowiedzi (począwszy od 0)
     * @param is_selected Czy wskazana odpowiedź ma być zaznaczona
     */
    public SetAnswerSelection(index: number, is_selected: boolean){
        this.IsAnswerSelected[index] = is_selected;
    }

    /**
     * Zwraca, czy dana odpowiedź jest zaznaczona
     * @param index Numer odpowiedzi (począwszy od 0)
     */
    public GetAnswerSelection(index: number){
        return this.IsAnswerSelected[index] ?? false;
    }

    /**
     * Zmienia zaznaczenie odpowiedzi
     * @param index Numer odpowiedzi (począwszy od 0)
     */
    public ToggleAnswerSelection(index: number){
        this.IsAnswerSelected[index] = !this.IsAnswerSelected[index];
    }

    /** Oznacza pytanie jako ukończone */
    public MarkAsDone(){
        this.IsDone = true;
    }

    /** Sprawdza, czy pytanie jest ukończone */
    public GetIsDone(){
        return this.IsDone;
    }

    /** Liczy uzyskane punkty */
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