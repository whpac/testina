import Card from '../basic/card';

export default class AssignmentsCard extends Card {

    constructor(){
        super('semi-wide');

        let heading = document.createElement('h2');
        heading.textContent = 'Przypisania';
        this.AppendChild(heading);

        let description = document.createElement('p');
        description.classList.add('secondary');
        description.textContent = 'Każdy wiersz tabeli odpowiada jednemu przypisaniu. Naciśnij przysisk „Szczegóły”, aby zobaczyć indywidualne wyniki uczniów. Możesz także dopisać test dodatkowym osobom.';
        this.AppendChild(description);
    }
}