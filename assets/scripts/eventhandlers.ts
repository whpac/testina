import * as GlobalState from './globalstate';
import * as TestEditor from './testeditor';
import * as Tests from './tests';
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
    AttachToSelector('.nav-toggle', 'click', () => UI.ToggleNavigationVisibility);
    AttachToSelector('.nav-backdrop', 'click', () => UI.HideNavigation);

    // These are responsible for the `tests/solve` page
    AttachToSelector('.start-test', 'click', () => function(e){
        if(e.target == null) return;

        let test_id = (<HTMLElement>e.target).dataset.testId;
        if(test_id === undefined) throw 'Nie odnaleziono parametru data-test-id w tym elemencie.';
        Tests.LoadTest(parseInt(test_id));
    });
    Attach('check-button', 'click', () => Tests.MarkAnswers);
    Attach('next-button', 'click', () => Tests.GoToNextQuestion);
    Attach('end-button', 'click', () => Tests.EndTest);

    // These are responsible for the `tests/edit` page
    AttachToSelector('.event-edit-question', 'click', () => function(e){
        if(e.target == null) return;

        let question_id = (<HTMLElement>e.target).dataset.questionId;
        if(question_id === undefined) throw 'Nie odnaleziono parametru data-question-id w tym elemencie.';
        TestEditor.EditQuestion(parseInt(question_id));
    });
    AttachToSelector('.event-remove-question', 'click', () => function(e){
        if(e.target == null) return;

        let question_id = (<HTMLElement>e.target).dataset.questionId;
        if(question_id === undefined) throw 'Nie odnaleziono parametru data-question-id w tym elemencie.';
        TestEditor.RemoveQuestion(parseInt(question_id));
    });
    Attach('add-question-button', 'click', () => TestEditor.AddQuestion);
    AttachToSelector('.event-made-changes-to-settings', 'change', () => TestEditor.MadeChangesToTestSettings);
    AttachToSelector('.event-update-test-time-limit', 'change', () => TestEditor.UpdateTimeLimitInput);
    Attach('save-test-settings-button', 'click', () => TestEditor.SaveTestSettings);
    Attach('remove-test-button', 'click', () => TestEditor.RemoveTest);
    AttachToSelector('.event-edit-question-made-changes', 'change', () => TestEditor.GetDialog().MadeChanges);
    Attach('add-answer-button', 'click', () => TestEditor.GetDialog().AddAnswer);
    Attach('save-question-button', 'click', () => TestEditor.GetDialog().SaveChanges);
    Attach('cancel-question-changes-button', 'click', () => TestEditor.GetDialog().CancelChanges);
}

/**
 * Attaches a event listener to element described by the given id
 * @param id - element's id
 * @param event - event to handle
 * @param listener - function returning reference to the handler
 */
export function Attach(id: string, event: string, listener: () => EventListenerOrEventListenerObject){
    let element = document.getElementById(id);
    element?.addEventListener(event, listener());
}

/**
 * Attaches event listeners to all elements described by the given selector
 * @param selector - CSS selector
 * @param event - event to handle
 * @param listener - function returning reference to the handler
 */
export function AttachToSelector(selector: string, event: string, listener: () => EventListenerOrEventListenerObject){
    let elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
        element.addEventListener(event, listener());
    });
}

export function $Handles(){
    
}