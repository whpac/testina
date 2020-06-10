/**
 * Displays a toast for a given period of time. Doesn't give any further control over the toast
 * @param text - Text to display
 * @param time - How long the toast will be visible
 */
export function Show(text: string, time: number = 5000){
    let toast = ShowPersistent(text);
    setTimeout(() => {
        toast.Hide();
    }, time);
}

/**
 * Displays a toast with specified toast and returns a Toast object
 * @param text - Text to display
 */
export function ShowPersistent(text: string){
    let toast_element = document.createElement('div');
    toast_element.classList.add('toast', 'hidden');
    toast_element.setAttribute('role', 'status');
    toast_element.innerText = text;
    document.body.appendChild(toast_element);

    let toast = new Toast(toast_element);

    toast.Show();
    return toast;
}

class Toast{
    ToastElement: HTMLElement

    constructor(toast_element: HTMLElement){
        this.ToastElement = toast_element;
    }

    /**
     * Displays the toast
     */
    Show(){
        window.requestAnimationFrame(() => {
            this.ToastElement.classList.remove('hidden');
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