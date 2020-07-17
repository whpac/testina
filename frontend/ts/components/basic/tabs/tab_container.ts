import Component from '../component';
import Tab from './tab';

/** Klasa reprezentująca grupę kart */
export default class TabContainer extends Component {
    /** Nazwa grupy. W każdej z nich aktywna może być tylko jedna karta */
    protected GroupName: string;
    /** Ilość kart */
    protected TabCount: number = 0;

    constructor(){
        super();

        this.Element.classList.add('tab-container');
        this.GroupName = this.GenerateRandomName();
    }

    /**
     * Dodaje kartę do zbioru. Jeśli to jest pierwsza karta, zaznacza ją.
     * @param tab Karta do dodania
     */
    AddTab(tab: Tab){
        tab.SetGroupName(this.GroupName);
        if(this.TabCount == 0) tab.Select();

        this.AppendChild(tab.GetElement());

        this.TabCount++;
    }

    /**
     * Generuje losową nazwę grupy
     * 
     * Tworzy losową liczbę z przedziału [0, 1], przekształca ją na reprezetację
     * w systemie liczbowym o podstawie 36 (czyli wykorzystującym wszystkie cyfry i litery).
     * Na koniec odczytuje pierwsze 9 cyfr po przecinku.
     */
    protected GenerateRandomName(){
        return '_' + Math.random().toString(36).substr(2, 9);
    };
}