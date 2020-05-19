var Toasts = {

    Show: function(text, time = 5000){
        let toast = Toasts.ShowPersistent(text);
        setTimeout(() => {
            toast.Hide();
        }, time);
    },

    ShowPersistent: function(text){
        let toast_element = document.createElement('div');
        toast_element.classList.add('toast', 'hidden');
        toast_element.setAttribute('role', 'status');
        toast_element.innerText = text;
        document.body.appendChild(toast_element);

        let toast = {
            ToastElement: toast_element,

            Show: function(){
                window.requestAnimationFrame(() => {
                    toast_element.classList.remove('hidden');
                });
            },
            Hide: function(){
                toast.ToastElement.classList.add('hidden');

                setTimeout(() => {
                    document.body.removeChild(toast.ToastElement);
                }, 700);
            }
        };

        toast.Show();
        return toast;
    }
}