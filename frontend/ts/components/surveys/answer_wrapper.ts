import Component from '../basic/component';
import Question from '../../entities/question';
import Answer from '../../entities/answer';
import SurveyAnswerRow from './survey_answer_row';
import { MoveElement } from '../../utils/arrayutils';
import NavigationPrevention from '../../1page/navigation_prevention';
import SurveyAnswerRowNA from './survey_answer_row_na';
import SurveyAnswerRowOther from './survey_answer_row_other';
import { StringKeyedCollection } from '../../entities/question_with_user_answers';

type SpecialAnswerRowsDescriptor = {
    NonApplicableRow: SurveyAnswerRow | undefined;
    OtherRow: SurveyAnswerRow | undefined;
};

export default class AnswerWrapper extends Component {
    protected ListElement: HTMLUListElement;
    protected AddAnswerButton: HTMLButtonElement | undefined;
    protected AnswerPlaceholderWrapper: HTMLElement;
    protected OpenAnswerInput: HTMLInputElement | undefined;
    protected RangeAnswerMinInput: HTMLInputElement | undefined;
    protected RangeAnswerMaxInput: HTMLInputElement | undefined;
    protected SpecialAnswersListElement: HTMLUListElement;

    protected Question: Question | undefined;
    protected QuestionType: number | undefined;
    protected EditMode: boolean;
    protected Answers: Answer[] | undefined;
    protected AnswerRows: SurveyAnswerRow[];
    protected SpecialAnswerRows: SpecialAnswerRowsDescriptor;

    public constructor(edit_mode: boolean = false) {
        super();

        this.EditMode = edit_mode;
        this.AnswerRows = [];

        this.ListElement = document.createElement('ul');
        this.AppendChild(this.ListElement);
        this.ListElement.classList.add('survey-answer-wrapper');

        this.AnswerPlaceholderWrapper = document.createElement('li');
        this.AnswerPlaceholderWrapper.classList.add('no-hover');
        this.ListElement.appendChild(this.AnswerPlaceholderWrapper);

        this.SpecialAnswersListElement = document.createElement('ul');
        this.AppendChild(this.SpecialAnswersListElement);
        this.SpecialAnswersListElement.classList.add('survey-answer-wrapper');

        this.SpecialAnswerRows = {
            NonApplicableRow: undefined,
            OtherRow: undefined
        };
    }

    public async Populate(question: Question | undefined) {
        this.Question = question;
        this.QuestionType = question?.Type ?? Question.TYPE_SINGLE_CHOICE;
        let questions_with_provided_answers = [Question.TYPE_SINGLE_CHOICE, Question.TYPE_MULTI_CHOICE];

        if(question !== undefined && this.QuestionType in questions_with_provided_answers) this.Answers = (await question.GetAnswers()).slice();
        else this.Answers = [];

        this.Answers.sort((a, b) => a.Order - b.Order);

        this.RenderAnswers();
    }

    public ChangeType(type: number) {
        this.QuestionType = type;
        this.RenderAnswers();
        this.SpecialAnswerRows.OtherRow?.SetQuestionType(type);
        this.SpecialAnswerRows.NonApplicableRow?.SetQuestionType(type);
    }

    public SetQuestion(question: Question) {
        this.Question = question;
    }

    protected RenderAnswers() {
        if(this.Answers !== undefined) {
            if(this.AnswerRows.length == 0) {
                for(let i = 0; i < this.Answers.length; i++) {
                    let answer = this.Answers[i];
                    if(this.QuestionType == Question.TYPE_SINGLE_CHOICE
                        || this.QuestionType == Question.TYPE_MULTI_CHOICE) {
                        this.RenderClosedAnswer(answer);
                    }
                }
            } else {
                for(let answer_row of this.AnswerRows) {
                    answer_row.SetQuestionType(this.QuestionType ?? Question.TYPE_SINGLE_CHOICE);
                }
            }
        }

        this.AnswerPlaceholderWrapper.textContent = '';
        this.OpenAnswerInput = undefined;
        this.RangeAnswerMinInput = undefined;
        this.RangeAnswerMaxInput = undefined;

        if((this.QuestionType == Question.TYPE_SINGLE_CHOICE
            || this.QuestionType == Question.TYPE_MULTI_CHOICE)
            && this.EditMode) {
            this.RenderAddAnswerButton();
            this.RefreshAnswerOrder();
        } else {
            this.RemoveAddAnswerButton();
        }

        if(this.QuestionType == Question.TYPE_OPEN_ANSWER) {
            this.RenderOpenAnswer();
        }

        if(this.QuestionType == Question.TYPE_RANGE) {
            this.RenderRangeAnswer();
        }

        this.RenderSpecialAnswers();
    }

    protected RefreshAnswerOrder() {
        for(let i = 0; i < this.AnswerRows.length; i++) {
            this.AnswerRows[i].IsFirst = (i == 0);
            this.AnswerRows[i].IsLast = (i == this.AnswerRows.length - 1);
        }

        for(let card of this.AnswerRows) {
            card.IsFirst = card.IsLast = false;
        }

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(this.AnswerRows[i].IsDeleted) continue;
            this.AnswerRows[i].IsFirst = true;
            break;
        }

        for(let i = this.AnswerRows.length - 1; i >= 0; i--) {
            if(this.AnswerRows[i].IsDeleted) continue;
            this.AnswerRows[i].IsLast = true;
            break;
        }
    }

    protected RenderClosedAnswer(answer: Answer | undefined) {
        let answer_row = new SurveyAnswerRow(this.EditMode);
        answer_row.Populate(this.Question, this.QuestionType ?? Question.TYPE_SINGLE_CHOICE, answer);
        answer_row.AddEventListener('moveup', (() => this.OnAnswerMovedUp(answer_row)).bind(this));
        answer_row.AddEventListener('movedown', (() => this.OnAnswerMovedDown(answer_row)).bind(this));
        answer_row.AddEventListener('markasdeleted', this.RefreshAnswerOrder.bind(this));
        answer_row.AddEventListener('markasundeleted', this.RefreshAnswerOrder.bind(this));
        answer_row.AddEventListener('checkedchange', this.OnRowSelectionChanged.bind(this));
        this.ListElement.appendChild(answer_row.GetElement());
        this.AnswerRows.push(answer_row);

        if(this.AnswerRows.length >= 2) {
            let prev = this.AnswerRows[this.AnswerRows.length - 2];
            prev.NextRow = answer_row;
            answer_row.PreviousRow = prev;
        }
    }

    protected RenderOpenAnswer() {
        this.OpenAnswerInput = document.createElement('input');
        this.OpenAnswerInput.type = 'text';
        if(!this.EditMode) this.OpenAnswerInput.placeholder = 'Wpisz odpowiedź';
        else this.OpenAnswerInput.placeholder = 'Tu użytkownik wpisze odpowiedź';
        this.OpenAnswerInput.disabled = this.EditMode;
        this.AnswerPlaceholderWrapper.appendChild(this.OpenAnswerInput);
    }

    protected RenderRangeAnswer() {
        if(this.EditMode) {
            let range_wrapper = document.createElement('div');
            range_wrapper.appendChild(document.createTextNode('Zakres od: '));

            this.RangeAnswerMinInput = document.createElement('input');
            this.RangeAnswerMinInput.type = 'number';
            this.RangeAnswerMinInput.min = '0';
            this.RangeAnswerMinInput.step = '1';
            this.RangeAnswerMinInput.value = this.Question?.Points.toString() ?? '0';
            range_wrapper.appendChild(this.RangeAnswerMinInput);

            range_wrapper.appendChild(document.createTextNode(' do: '));

            this.RangeAnswerMaxInput = document.createElement('input');
            this.RangeAnswerMaxInput.type = 'number';
            this.RangeAnswerMaxInput.min = '0';
            this.RangeAnswerMaxInput.step = '1';
            this.RangeAnswerMaxInput.value = this.Question?.MaxTypos.toString() ?? '10';
            range_wrapper.appendChild(this.RangeAnswerMaxInput);
            this.AnswerPlaceholderWrapper.appendChild(range_wrapper);
        } else {
            this.OpenAnswerInput = document.createElement('input');

            let buttons_wrapper = document.createElement('div');
            buttons_wrapper.classList.add('range');
            let buttons: HTMLButtonElement[] = [];

            let min = this.Question?.Points ?? 0;
            let max = this.Question?.MaxTypos ?? 10;

            for(let i = min; i <= max; i++) {
                let button = document.createElement('button');
                button.textContent = i.toString();
                button.addEventListener('click', () => {
                    let was_selected = button.classList.contains('selected');
                    for(let btn of buttons) {
                        btn.classList.remove('selected');
                    }
                    if(was_selected) {
                        if(this.OpenAnswerInput !== undefined) this.OpenAnswerInput.value = '';
                        return;
                    }
                    button.classList.add('selected');
                    if(this.OpenAnswerInput !== undefined) this.OpenAnswerInput.value = i.toString();
                });
                buttons_wrapper.appendChild(button);
                buttons.push(button);
            }
            this.AnswerPlaceholderWrapper.appendChild(buttons_wrapper);
        }
    }

    protected RenderSpecialAnswers() {
        if(this.SpecialAnswerRows.NonApplicableRow === undefined) {
            this.SpecialAnswerRows.NonApplicableRow = new SurveyAnswerRowNA(this.EditMode);
            this.SpecialAnswerRows.NonApplicableRow.Populate(this.Question, this.QuestionType ?? Question.TYPE_SINGLE_CHOICE, undefined);
            this.SpecialAnswerRows.NonApplicableRow.AddEventListener('checkedchange', this.OnRowSelectionChanged.bind(this));
        }
        if(this.SpecialAnswerRows.OtherRow === undefined) {
            this.SpecialAnswerRows.OtherRow = new SurveyAnswerRowOther(this.EditMode);
            this.SpecialAnswerRows.OtherRow.Populate(this.Question, this.QuestionType ?? Question.TYPE_SINGLE_CHOICE, undefined);
            this.SpecialAnswerRows.OtherRow.AddEventListener('checkedchange', this.OnRowSelectionChanged.bind(this));
        }
        this.SpecialAnswersListElement.appendChild(this.SpecialAnswerRows.OtherRow.GetElement());
        this.SpecialAnswersListElement.appendChild(this.SpecialAnswerRows.NonApplicableRow.GetElement());
    }

    protected RenderAddAnswerButton() {
        if(this.AddAnswerButton !== undefined) return;

        this.AddAnswerButton = document.createElement('button');
        this.AddAnswerButton.classList.add('survey-add-answer-button');
        this.AddAnswerButton.textContent = 'Dodaj odpowiedź';
        this.AddAnswerButton.addEventListener('click', this.AddNewAnswer.bind(this));
        this.AppendChild(this.AddAnswerButton);
    }

    protected RemoveAddAnswerButton() {
        if(this.AddAnswerButton === undefined) return;

        this.AddAnswerButton.remove();
        this.AddAnswerButton = undefined;
    }

    protected OnAnswerMovedUp(answer_row: SurveyAnswerRow) {
        if(answer_row.PreviousRow === null) return;

        let former_prev = answer_row.PreviousRow;
        let new_prev = former_prev.PreviousRow;
        let former_next = answer_row.NextRow;

        if(new_prev !== null) new_prev.NextRow = answer_row;
        former_prev.PreviousRow = answer_row;
        former_prev.NextRow = former_next;
        answer_row.PreviousRow = new_prev;
        answer_row.NextRow = former_prev;
        if(former_next !== null) former_next.PreviousRow = former_prev;

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(answer_row == this.AnswerRows[i]) {
                MoveElement(this.AnswerRows, i, i - 1);
                break;
            }
        }

        this.RefreshAnswerOrder();
        NavigationPrevention.Prevent('survey-editor');
    }

    protected OnAnswerMovedDown(answer_row: SurveyAnswerRow) {
        if(answer_row.NextRow === null) return;

        let former_prev = answer_row.PreviousRow;
        let former_next = answer_row.NextRow;
        let new_next = former_next.NextRow;

        if(former_prev !== null) former_prev.NextRow = former_next;
        answer_row.PreviousRow = former_next;
        answer_row.NextRow = new_next;
        former_next.PreviousRow = former_prev;
        former_next.NextRow = answer_row;
        if(new_next !== null) new_next.PreviousRow = answer_row;

        for(let i = 0; i < this.AnswerRows.length; i++) {
            if(answer_row == this.AnswerRows[i]) {
                MoveElement(this.AnswerRows, i, i + 1);
                break;
            }
        }

        this.RefreshAnswerOrder();
        NavigationPrevention.Prevent('survey-editor');
    }

    protected AddNewAnswer() {
        this.RenderClosedAnswer(undefined);
        this.RefreshAnswerOrder();
        NavigationPrevention.Prevent('survey-editor');
    }

    public async Save() {
        let order = 0;
        let save_awaiters: Promise<void>[] = [];

        for(let answer_row of this.AnswerRows) {
            if(!answer_row.IsDeleted) order++;
            if(this.Question !== undefined) answer_row.SetQuestion(this.Question);
            save_awaiters.push(answer_row.Save(order));
        }
        for(let awaiter of save_awaiters) await awaiter;
    }

    public GetUserAnswers() {
        if(this.OpenAnswerInput !== undefined) {
            let value = this.OpenAnswerInput.value.trim();
            if(value != '') return value;
        }

        let answers: StringKeyedCollection<string | boolean> = {};
        for(let answer of this.AnswerRows) {
            let answer_id = answer.GetAnswerId();
            if(answer_id === undefined) continue;
            answers[answer_id.toString()] = answer.GetValue();
        }
        let na_row = this.SpecialAnswerRows.NonApplicableRow;
        if(na_row !== undefined && na_row.GetAnswerId() !== undefined) {
            answers[na_row.GetAnswerId() as number] = na_row.GetValue();
        }
        let other_row = this.SpecialAnswerRows.OtherRow;
        if(other_row !== undefined && other_row.GetAnswerId() !== undefined) {
            answers[other_row.GetAnswerId() as number] = other_row.GetValue();
        }
        return answers;
    }

    protected OnRowSelectionChanged() {
        for(let answer_row of this.AnswerRows) {
            answer_row.OnSelectionChanged();
        }
        this.SpecialAnswerRows.NonApplicableRow?.OnSelectionChanged();
        this.SpecialAnswerRows.OtherRow?.OnSelectionChanged();
    }

    public IsNASelected() {
        return this.SpecialAnswerRows.NonApplicableRow?.GetValue() == true;
    }

    public IsOtherSelected() {
        return (this.SpecialAnswerRows.OtherRow?.GetValue() ?? false) !== false;
    }

    public GetRange(): [number, number] {
        if(this.RangeAnswerMinInput === undefined || this.RangeAnswerMaxInput === undefined) return [0, 0];

        return [
            parseInt(this.RangeAnswerMinInput.value),
            parseInt(this.RangeAnswerMaxInput.value)
        ];
    }
}