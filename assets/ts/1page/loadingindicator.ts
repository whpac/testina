export default class LoadingIndicator {
    LoadingWrapperElement: HTMLElement;

    constructor(wrapper_id: string){
        let wrapper = document.getElementById(wrapper_id);
        if(wrapper == null) throw 'Element with id ' + wrapper_id + ' doesn\'t exist.';

        this.LoadingWrapperElement = wrapper;
    }

    Display(){
        this.LoadingWrapperElement.style.display = 'block';
    }

    Hide(){
        this.LoadingWrapperElement.style.display = 'none';
    }

    IsVisible(){
        return this.LoadingWrapperElement.style.display != 'none';
    }
}