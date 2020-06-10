import * as Dialogs from './dialogs';

interface DialogButtonDescriptor{
    Text: string,
    Callback: () => void,
    Classes: string[]
}

export default class DialogObject{
    DialogElement: HTMLElement;
    DialogClasses: string[] = [];
    Header: string = '';
    Content: (string | HTMLElement)[] = [];
    Buttons: DialogButtonDescriptor[] = [];
    IsRendered: boolean = false;

    constructor(){
        this.DialogElement = document.createElement('div');
    }

    /**
     * Sets dialog header to given text
     * @param text Header
     */
    SetHeader(text: string){
        this.Header = text;
    }

    /**
     * Adds button to dialog
     * @param btn_text button text
     * @param callback function called on click
     * @param classes button CSS classes
     */
    AddButton(btn_text: string, callback: () => void, classes: string[] = []){
        this.Buttons.push({Text: btn_text, Callback: callback, Classes: classes}); 
    }

    /**
     * Appends content
     * @param elem element to append
     */
    AddContent(elem: string | HTMLElement){
        this.Content.push(elem);
    }

    /**
     * Adds CSS classes to the dialog
     * @param classes - array of classes to add
     */
    AddClasses(classes: string[]){
        this.DialogClasses.push(...classes);
    }

    /**
     * Prepares dialog object to be displayed
     */
    Render(){
        this.DialogElement.setAttribute('role', 'alertdialog');
        this.DialogElement.classList.add('dialog');
        this.DialogElement.classList.add(...this.DialogClasses);
        
        if(this.Header != ''){
            let h2 = document.createElement('h2');
            h2.innerHTML = this.Header;
            this.DialogElement.appendChild(h2);
        }
        
        var content_wrapper = document.createElement('div');
        content_wrapper.classList.add('content');
        
        this.Content.forEach((elem) => {
            if(typeof elem == 'string') content_wrapper.innerHTML += elem;
            else content_wrapper.appendChild(elem);
        });
        this.DialogElement.appendChild(content_wrapper);

        var button_wrapper = document.createElement('div');
        button_wrapper.classList.add('buttons');

        this.Buttons.forEach((button) => {
            let btn = document.createElement('button');
            btn.innerText = button.Text;
            btn.addEventListener('click', button.Callback);
            if(button.Classes.length > 0)
                btn.classList.add(...button.Classes);

            button_wrapper.appendChild(btn);
        });
        this.DialogElement.appendChild(button_wrapper);
        this.IsRendered = true;
    }

    /**
     * Displays the dialog
     */
    Show(){
        if(!this.IsRendered) this.Render();
        Dialogs.ShowDialog(this.DialogElement);
    }

    /**
     * Hides the dialog
     */
    Hide(){
        Dialogs.HideDialog(this.DialogElement);
    }
}