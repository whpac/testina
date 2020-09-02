import Card from '../basic/card';
import Test from '../../entities/test';
import SurveyTable from './survey_table';

export default class SurveyListCard extends Card {
    protected SurveyTable: SurveyTable;

    public constructor() {
        super();

        let heading = document.createElement('h2');
        this.AppendChild(heading);
        heading.textContent = 'Ankiety';

        this.SurveyTable = new SurveyTable();
        this.AppendChild(this.SurveyTable);
    }

    public Populate(surveys: Test[]) {
        this.SurveyTable.Populate(surveys);
    }
}