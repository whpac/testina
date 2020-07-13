export default class Toast{
    ToastElement: HTMLElement

    constructor(text: string = ''){
        this.ToastElement = document.createElement('div');
        this.ToastElement.classList.add('toast', 'hidden');
        this.ToastElement.setAttribute('role', 'status');
        this.ToastElement.innerText = text;
        document.body.appendChild(this.ToastElement);
    }

    /**
     * Ustawia tekst wyświetlany w plakietce
     * @param text Tekst do wyświetlenia
     */
    SetText(text: string){
        this.ToastElement.innerText = text;
    }

    /**
     * Pokazuje plakietkę. Jeśli podano czas, po jego upłynięciu plakietka się schowa
     * @param time Czas, po którym plakietka ma się schować automatycznie
     */
    Show(time?: number){
        window.requestAnimationFrame(() => {
            this.ToastElement.classList.remove('hidden');

            if(time === undefined) return;
            setTimeout(() => {
                this.Hide();
            }, time);
        });
    }

    /**
     * Hides the toast and removes it from DOM
     */
    Hide(){
        this.ToastElement.classList.add('hidden');

        setTimeout(() => {
            document.body.removeChild(this.ToastElement);
        }, 700);
    }
}