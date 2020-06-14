import * as GlobalState from './globalstate';
import * as UI from './ui';

/**
 * Adds event handlers to the UI
 */
export function AttachHandlersIfDOMLoaded(){
    GlobalState.RunOnReady(AttachHandlers);
}

export function AttachHandlers(){
    // This is to disable some CSS transitions on startup
    document.querySelector('body')?.classList.remove('preload');

    // Add event handlers for toggling the navbar
    AttachToSelector('.nav-toggle', 'click', UI.ToggleNavigationVisibility);
    AttachToSelector('.nav-backdrop', 'click', UI.HideNavigation);

    window.addEventListener('beforeunload', (event) => {
        if(GlobalState.PreventsFromExit()){
            // Cancel the event as stated by the standard.
            event.preventDefault();
            // Chrome requires returnValue to be set.
            event.returnValue = '';
            return '';
        }
      });
}

/**
 * Attaches a event listener to element described by the given id
 * @param id - element's id
 * @param event - event to handle
 * @param listener - function returning reference to the handler
 */
export function Attach(id: string, event: string, listener: EventListenerOrEventListenerObject){
    let element = document.getElementById(id);
    element?.addEventListener(event, listener);
}

/**
 * Attaches event listeners to all elements described by the given selector
 * @param selector - CSS selector
 * @param event - event to handle
 * @param listener - function returning reference to the handler
 */
export function AttachToSelector(selector: string, event: string, listener: EventListenerOrEventListenerObject){
    let elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
        element.addEventListener(event, listener);
    });
}

/**
 * Attaches event listeners to all elements described by the given selector.
 * If the DOM is not loaded, the event listener will be added after DOM is interactive
 * @param selector - CSS selector
 * @param event - event to handle
 * @param listener - reference to the handler
 */
export function $Handles(selector: string, event: string, listener: EventListenerOrEventListenerObject){
    GlobalState.RunOnReady(() => {
        if(selector.startsWith('#')) Attach(selector.substr(1), event, listener);
        else AttachToSelector(selector, event, listener);
    });
}