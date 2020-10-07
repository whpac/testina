import Card from '../basic/card';
import Test from '../../entities/test';
import SurveyTable from './survey_table';
import Toast from '../basic/toast';
import SurveyLoader from '../../entities/loaders/surveyloader';

export default class SurveyListCard extends Card {
    protected SurveyTable: SurveyTable;

    public constructor() {
        super('semi-wide');

        let buttons_wrapper = document.createElement('div');
        buttons_wrapper.classList.add('header-buttons');
        this.AppendChild(buttons_wrapper);

        let create_button = document.createElement('button');
        create_button.classList.add('button', 'header-button');
        create_button.innerHTML = '<i class="fa fa-plus icon"></i><span>Utwórz nową</span>';
        create_button.addEventListener('click', this.CreateSurvey.bind(this));
        buttons_wrapper.appendChild(create_button);

        let heading = document.createElement('h2');
        this.AppendChild(heading);
        heading.textContent = 'Twoje ankiety';

        let description = document.createElement('p');
        this.AppendChild(description);
        description.classList.add('secondary');
        description.textContent = 'W tej sekcji są wyświetlane wszystkie utworzone przez Ciebie ankiety.';

        this.SurveyTable = new SurveyTable();
        this.AppendChild(this.SurveyTable);
    }

    public Populate(surveys: Test[]) {
        this.SurveyTable.Populate(surveys);
    }

    public async CreateSurvey() {
        let creating_toast = new Toast('Tworzenie ankiety...');
        creating_toast.Show();

        try {
            let survey = await Test.Create('[Bez nazwy]', 1, 0, Test.TYPE_SURVEY, SurveyLoader.LoadById);
            this.SurveyTable.AddSurvey(survey);
        } catch(e) {
            let message = '.';
            if('Message' in e) message = ': ' + e.Message;
            else message = e;

            new Toast('Nie udało się utworzyć ankiety' + message).Show(0);
        } finally {
            creating_toast.Hide();
        }
    }
}