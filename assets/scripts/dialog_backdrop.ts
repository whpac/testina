/**
 * Object used as a backdrop under dialogs
 */
let BackdropElement: HTMLElement;

/**
 * Displays dialog backdrop
 */
export function Display(){
    if(BackdropElement === undefined){
        BackdropElement = document.createElement('div');
        BackdropElement.classList.add('dialog-backdrop');
        document.body.appendChild(BackdropElement);
    }
    BackdropElement.classList.add('shown');
}

/**
 * Hides dialog backdrop
 */
 export function Hide(){
    BackdropElement.classList.remove('shown');
}

/**
 * Appends the given element to the backdrop causing it to show up
 * @param element - Element to display
 */
export function AppendElement(element: HTMLElement){
    BackdropElement.appendChild(element);
}

/**
 * Removes the given element from the backdrop
 * @param element - Element to remove
 */
export function RemoveElement(element: HTMLElement){
    BackdropElement.removeChild(element);
}