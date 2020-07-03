import * as Dialogs from '../../dialogs';
import HelpLink from '../help_link';

export default class Dialog{
    DialogElement: HTMLElement;
    HeaderElement: HTMLHeadingElement;
    HeaderContentElement: HTMLSpanElement;
    Content: Node[] = [];
    Buttons: HTMLButtonElement[] = [];
    IsRendered: boolean = false;

    constructor(){
        this.DialogElement = document.createElement('div');
        this.DialogElement.setAttribute('role', 'alertdialog');
        this.DialogElement.classList.add('dialog');

        this.HeaderElement = document.createElement('h2');
        this.DialogElement.appendChild(this.HeaderElement);

        this.HeaderContentElement = document.createElement('span');
        this.HeaderElement.appendChild(this.HeaderContentElement);
    }

    /**
     * Sets dialog header to given text
     * @param text Header text
     */
    SetHeader(text: string){
        this.HeaderContentElement.innerText = text;
    }

    /**
     * Adds button to dialog
     * @param btn_text Button text
     * @param callback Function called on click
     * @param classes Button CSS classes
     */
    AddButton(btn: HTMLButtonElement){ //btn_text: string, callback: () => void, classes: string[] = []){
        //this.Buttons.push({Text: btn_text, Callback: callback, Classes: classes}); 
        this.Buttons.push(btn);
    }

    /**
     * Appends content
     * @param elem Element to append
     */
    AddContent(elem: Node){
        this.Content.push(elem);
    }

    /**
     * Adds CSS classes to the dialog
     * @param classes Array of classes to add
     */
    AddClasses(classes: string[]){
        this.DialogElement.classList.add(...classes);
    }

    /**
     * Displays question mark button, leading to a help page
     */
    DisplayHelpButton(target?: string){
        this.HeaderElement.appendChild(new HelpLink(target).GetElement());
    }

    /**
     * Prepares dialog object to be displayed
     */
    Render(){
        var content_wrapper = document.createElement('div');
        content_wrapper.classList.add('content');
        
        this.Content.forEach((elem) => {
            content_wrapper.appendChild(elem);
        });
        this.DialogElement.appendChild(content_wrapper);

        var button_wrapper = document.createElement('div');
        button_wrapper.classList.add('buttons');

        /*this.Buttons.forEach((button) => {
            let btn = document.createElement('button');
            btn.innerText = button.Text;
            btn.addEventListener('click', button.Callback);
            if(button.Classes.length > 0)
                btn.classList.add(...button.Classes);

            button_wrapper.appendChild(btn);
        });*/
        this.Buttons.forEach((button) => {
            button_wrapper.appendChild(button);
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