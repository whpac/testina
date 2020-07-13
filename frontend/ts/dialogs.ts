import * as DialogBackdrop from './dialog_backdrop';
import Dialog from './components/basic/dialog';

type DialogButtonDescriptorWithHide = Array<[string, ('[hide]' | ( () => void )), string[]]>;

/**
 * Displays given element as a dialog
 * @param target - DOM element or id to display
 */
export function ShowDialog(target: string | HTMLElement){
    let element;

    if(typeof target == 'string')
        element = document.getElementById(target);
    else 
        element = target;
    
    if(element === null) return;

    element.classList.add('shown');

    DialogBackdrop.Display();
    DialogBackdrop.AppendElement(element);
}

/**
 * Hides given element which is being displayed as a dialog
 * @param target - DOM element or id to hide
 */
export function HideDialog(target: string | HTMLElement){
    let element;

    if(typeof target == 'string')
        element = document.getElementById(target);
    else
        element = target;

    if(element === null) return;

    DialogBackdrop.Hide();
    DialogBackdrop.RemoveElement(element);
    
    element.classList.remove('shown');
}

/**
 * Creates dialog object
 */
export function CreateDialog(){
    return new Dialog();
}

/**
 * Creates a simple dialog
 * @param text dialog content
 * @param buttons Array of button descriptors [Caption, Callback or '[hide]', CSS classes].
 * @param header Dialog title
 */
export function CreateSimpleDialog(text: string, buttons?: DialogButtonDescriptorWithHide, header?: string){
    let dialog = CreateDialog();

    buttons = buttons ?? [['OK', '[hide]', []]];

    if(header !== undefined) dialog.SetHeader(header);
    dialog.AddContent(document.createTextNode(text));

    buttons.forEach((btn) => {
        let callback = btn[1];
        if(callback == '[hide]') callback = () => {dialog.Hide()};

        let button = document.createElement('button');
        button.textContent = btn[0];
        button.addEventListener('click', callback);
        button.classList.add(...btn[2]);

        dialog.AddButton(button);
    });

    return dialog;
}