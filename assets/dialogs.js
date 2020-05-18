var Dialogs = {

    /**
     * Object used as a backdrop under dialogs
     * @type {HTMLElement}
     */
    BackdropElement: undefined,
    
    /**
     * Displays given element as dialog
     * @param {string|HTMLElement} target DOM element or id to display
     */
    ShowDialog: function(target){
        var element;

        if(typeof target == 'string')
            element = document.getElementById(target);
        else 
            element = target;
        
        element.classList.add('shown');

        Dialogs.DisplayBackdrop();
        Dialogs.BackdropElement.appendChild(element);
    },

    /**
     * Hides given element which is being displayed as dialog
     * @param {string|HTMLElement} target DOM element or id to hide
     */
    HideDialog: function(target){
        if(typeof target == 'string')
            element = document.getElementById(target);
        else
            element = target;

        Dialogs.HideBackdrop();
        element.classList.remove('shown');
        Dialogs.BackdropElement.removeChild(element);
    },

    /**
     * Creates dialog object
     */
    CreateDialog: function(){
        return {
            /** @type {HTMLElement} */
            DialogElement: undefined,
            DialogClasses: [],
            Header: '',
            Content: [],
            Buttons: [],

            /**
             * Sets dialog header to given text
             * @param {string} text Header
             */
            SetHeader: function(text){
                this.Header = text;
            },

            /**
             * Adds button to dialog
             * @param {string} btn_text button text
             * @param {function} callback function called on click
             * @param {string[]} classes button CSS classes
             */
            AddButton: function(btn_text, callback, classes = []){
                this.Buttons.push({Text: btn_text, Callback: callback, Classes: classes}); 
            },

            /**
             * Appends content
             * @param {string|HTMLElement} elem element to append
             */
            AddContent: function(elem){
                this.Content.push(elem);
            },

            AddClasses: function(classes){
                this.DialogClasses.push(...classes);
            },

            /**
             * Prepares dialog object to be displayed
             */
            Render: function(){
                this.DialogElement = document.createElement('div');
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
            },

            /**
             * Displays the dialog
             */
            Show: function(){
                if(this.DialogElement == undefined) this.Render();
                Dialogs.ShowDialog(this.DialogElement);
            },

            /**
             * Hides the dialog
             */
            Hide: function(){
                Dialogs.HideDialog(this.DialogElement);
            }
        };
    },

    /**
     * Displays dialog backdrop
     */
    DisplayBackdrop: function(){
        if(Dialogs.BackdropElement === undefined){
            Dialogs.BackdropElement = document.createElement('div');
            Dialogs.BackdropElement.classList.add('dialog-backdrop');
            document.body.appendChild(Dialogs.BackdropElement);
        }
        Dialogs.BackdropElement.classList.add('shown');
    },

    /**
     * Hides dialog backdrop
     */
    HideBackdrop: function(){
        Dialogs.BackdropElement.classList.remove('shown');
    },

    /**
     * Creates simple dialog
     * @param {string} text dialog content
     * @param {array} buttons Array of button descriptors [Caption, Callback or '[hide]', CSS classes]. Nullable
     * @param {string} header Dialog title
     */
    CreateSimpleDialog: function(text, buttons = undefined, header = undefined){
        let dialog = Dialogs.CreateDialog();

        if(buttons === undefined || buttons === null){
            buttons = [['OK', '[hide]', []]];
        }

        if(header !== undefined) dialog.SetHeader(header);
        dialog.AddContent(text);

        buttons.forEach((btn) => {
            let callback = btn[1];
            if(callback == '[hide]') callback = () => {dialog.Hide()};

            dialog.AddButton(btn[0], callback, btn[2]);
        });

        return dialog;
    }
}