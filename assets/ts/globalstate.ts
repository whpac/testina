let PreventFromExitReasons = new Set<string>();

export function PreventsFromExit(){
    return PreventFromExitReasons.size != 0;
}

export function AddPreventFromExitReason(reason: string){
    PreventFromExitReasons.add(reason);
}

export function RemovePreventFromExitReason(reason: string){
    PreventFromExitReasons.delete(reason);
}

/**
 * Executes given function when or if the DOM is loaded
 * @param fn function to execute
 */
export function RunOnReady(fn: () => void){
    let readyState = document.readyState;
    if(readyState == 'interactive' || readyState == 'complete'){
        fn();
    }else{
        document.addEventListener('readystatechange', (event) => {
            if(document.readyState == 'interactive'){
                fn();
            }
        });
    }
}