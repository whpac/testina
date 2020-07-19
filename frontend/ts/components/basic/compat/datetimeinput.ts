import Component from '../component';

/** Klasa, która zapewnia zastępczą implementację dla pola input type=datetime-local */
export default class DateTimeInput extends Component {
    /** Prawdziwy element input */
    protected RealInput: HTMLInputElement;

    /** Pole wyboru lat */
    protected YearSelect: HTMLSelectElement | undefined;

    /** Pole wyboru miesięcy */
    protected MonthSelect: HTMLSelectElement | undefined;

    /** Pole wyboru dni */
    protected DaySelect: HTMLSelectElement | undefined;

    /** Pole wyboru godzin */
    protected HourSelect: HTMLSelectElement | undefined;

    /** Pole wyboru minut */
    protected MinuteSelect: HTMLSelectElement | undefined;

    constructor(){
        super();

        this.RealInput = document.createElement('input');
        this.RealInput.type = 'datetime-local';
        this.Element = this.RealInput;

        if(this.RealInput.type === 'text'){
            this.Element = document.createElement('span');
            this.Element.classList.add('input');

            this.YearSelect = document.createElement('select');
            this.MonthSelect = document.createElement('select');
            this.DaySelect = document.createElement('select');
            this.HourSelect = document.createElement('select');
            this.MinuteSelect = document.createElement('select');

            this.YearSelect.classList.add('hide-arrow');
            this.MonthSelect.classList.add('hide-arrow');
            this.DaySelect.classList.add('hide-arrow');
            this.HourSelect.classList.add('hide-arrow');
            this.MinuteSelect.classList.add('hide-arrow');

            let separator = document.createElement('span');
            separator.classList.add('separator');

            this.AppendChild(this.DaySelect);
            this.AppendChild(separator.cloneNode(false));
            this.AppendChild(this.MonthSelect);
            this.AppendChild(separator.cloneNode(false));
            this.AppendChild(this.YearSelect);

            separator.classList.add('spaced');
            this.AppendChild(separator.cloneNode(false));

            this.AppendChild(this.HourSelect);
            this.AppendChild(':');
            this.AppendChild(this.MinuteSelect);

            this.PopulateYears();
            this.PopulateMonths();
            this.PopulateDays();
            this.PopulateHours();
            this.PopulateMinutes();

            this.YearSelect.addEventListener('change', this.PopulateDays.bind(this));
            this.MonthSelect.addEventListener('change', this.PopulateDays.bind(this));
        }
    }

    /**
     * Ustawia datę wyświetlaną w polu
     * @param new_value Data w formacie yyyy-mm-ddThh:mm
     */
    SetValue(new_value: string | Date){
        if(this.YearSelect === undefined
            || this.MonthSelect === undefined
            || this.DaySelect === undefined
            || this.HourSelect === undefined
            || this.MinuteSelect === undefined){
            
            if(typeof new_value === 'string'){
                this.RealInput.value = new_value;
            }else{
                let month = '0' + (new_value.getMonth() + 1).toString();
                month = month.substr(month.length - 2, 2);
                let day = '0' + new_value.getDate().toString();
                day = day.substr(day.length - 2, 2);
                let hour = '0' + new_value.getHours().toString();
                hour = hour.substr(hour.length - 2, 2);
                let minute = '0' + new_value.getMinutes().toString();
                minute = minute.substr(minute.length - 2, 2);

                let date = '';
                date += new_value.getFullYear().toString() + '-';
                date += month + '-';
                date += day + 'T';
                date += hour + ':';
                date += minute;
                this.RealInput.value = date;
            }
        }else{
            let date = new Date(new_value);
            this.YearSelect.value = date.getFullYear().toString();
            this.MonthSelect.value = (date.getMonth() + 1).toString();
            this.DaySelect.value = date.getDate().toString();
            this.HourSelect.value = date.getHours().toString();
            this.MinuteSelect.value = date.getMinutes().toString();
        }
    }

    /** Zwraca wartość umieszczoną w polu */
    GetValue(){
        if(this.YearSelect === undefined
            || this.MonthSelect === undefined
            || this.DaySelect === undefined
            || this.HourSelect === undefined
            || this.MinuteSelect === undefined){
            return this.RealInput.value;
        }else{
            let month = '0' + this.MonthSelect.value;
            month = month.substr(month.length - 2, 2);
            let day = '0' + this.DaySelect.value;
            day = day.substr(day.length - 2, 2);
            let hour = '0' + this.HourSelect.value;
            hour = hour.substr(hour.length - 2, 2);
            let minute = '0' + this.MinuteSelect.value;
            minute = minute.substr(minute.length - 2, 2);

            let output = '';
            output += this.YearSelect.value + '-';
            output += month + '-';
            output += day + 'T';
            output += hour + ':';
            output += minute;
            return output;
        }
    }

    /**
     * Usuwa wszystkie opcje z przekazanego elementu select
     * @param select Lista rozwijana do wyczyszczenia
     */
    protected ClearSelect(select: HTMLSelectElement){
        while(select.firstChild !== null){
            select.firstChild.remove();
        }
    }

    /** Wypełnia pole wyboru lat */
    protected PopulateYears(){
        if(this.YearSelect === undefined) return;
        this.ClearSelect(this.YearSelect);

        let current_year = new Date().getFullYear();
        for(let year = current_year; year < current_year + 2; year++){
            let option = document.createElement('option');
            option.textContent = year.toString();
            option.value = year.toString();
            if(year == current_year) option.selected = true;
            this.YearSelect.appendChild(option);
        }
    }

    /** Wypełnia pole wyboru miesięcy */
    protected PopulateMonths(){
        if(this.MonthSelect === undefined) return;
        this.ClearSelect(this.MonthSelect);

        let months = [
            'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
            'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
        ];
        let current_month = new Date().getMonth();
        for(let month_number = 0; month_number < months.length; month_number++){
            let option = document.createElement('option');
            option.textContent = months[month_number];
            option.value = (month_number + 1).toString();
            if(month_number == current_month) option.selected = true;
            this.MonthSelect.appendChild(option);
        }
    }

    /** Wypełnia pole wyboru dni, z uwzględnieniem ilości dni w wybranym miesiącu */
    protected PopulateDays(){
        if(this.DaySelect === undefined) return;
        if(this.MonthSelect === undefined) return;
        if(this.YearSelect === undefined) return;

        let selected_day = this.DaySelect.value;
        this.ClearSelect(this.DaySelect);

        let days = 31;
        switch(this.MonthSelect.value){
            case '4':
            case '6':
            case '9':
            case '11':
                days = 30;
                break;
            case '2':
                let is_leap = new Date(parseInt(this.YearSelect.value), 1 /* (luty) */, 29).getMonth() == 1;
                days = is_leap ? 29 : 28;
                break;
        }

        let current_day = new Date().getDate();
        for(let day = 1; day <= days; day++){
            let option = document.createElement('option');
            option.textContent = day.toString();
            option.value = day.toString();
            if(day == current_day) option.selected = true;
            this.DaySelect.appendChild(option);
        }

        if(selected_day != ''){
            this.DaySelect.value = selected_day;
            let selected_day_num = parseInt(selected_day);

            if(this.DaySelect.value === "") {
                this.DaySelect.value = (selected_day_num - 1).toString();
            }

            if(this.DaySelect.value === "") {
                this.DaySelect.value = (selected_day_num - 2).toString();
            }

            if(this.DaySelect.value === "") {
                this.DaySelect.value = (selected_day_num - 3).toString();
            }
        }
    }

    /** Wypełnia pole wyboru godzin */
    protected PopulateHours(){
        if(this.HourSelect === undefined) return;
        this.ClearSelect(this.HourSelect);

        let current_hour = new Date().getHours();
        for(let hour = 0; hour < 24; hour++){
            let option = document.createElement('option');
            option.textContent = hour.toString();
            option.value = hour.toString();
            if(hour == current_hour) option.selected = true;
            this.HourSelect.appendChild(option);
        }
    }

    /** Wypełnia pole wyboru minut */
    protected PopulateMinutes(){
        if(this.MinuteSelect === undefined) return;
        this.ClearSelect(this.MinuteSelect);

        let current_minute = new Date().getMinutes();
        for(let minute = 0; minute < 60; minute++){
            let option = document.createElement('option');
            option.textContent = ((minute < 10) ? '0' : '') + minute.toString();
            option.value = minute.toString();
            if(minute == current_minute) option.selected = true;
            this.MinuteSelect.appendChild(option);
        }
    }
}