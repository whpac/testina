var Toasts = {

    Show: function(text, time = 5000){
        let toast_element = document.createElement('div');
        toast_element.classList.add('toast', 'hidden');
        toast_element.setAttribute('role', 'status');
        toast_element.innerText = text;
        document.body.appendChild(toast_element);

        window.requestAnimationFrame(() => {
            toast_element.classList.remove('hidden');

            setTimeout(() => {
                toast_element.classList.add('hidden');

                setTimeout(() => {
                    document.body.removeChild(toast_element);
                }, 700);
            }, time);
        });
    }
}