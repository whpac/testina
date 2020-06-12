import * as EventHandlers from './eventhandlers';
import * as GlobalState from './globalstate';

EventHandlers.AttachHandlersIfDOMLoaded();
$(window).on('load', onLoad);

function onLoad(){
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