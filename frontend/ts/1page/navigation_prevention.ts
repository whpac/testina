export default class NavigationPrevention {
    /** Zbiór powodów, które uniemożliwiają nawigację */
    protected static Reasons = new Set<string>();

    /**
     * Powoduje, że przed opuszczeniem strony, użytkownik zobaczy okienko z potwierdzeniem wyjścia
     * @param reason Identyfikator powodu blokady (niewyświetlany użytkownikowi)
     */
    public static Prevent(reason: string){
        this.Reasons.add(reason);
    }

    /**
     * Znosi blokadę opuszczenia strony
     * @param reason Identyfikator powodu blokady do zniesienia
     */
    public static Unprevent(reason: string){
        this.Reasons.delete(reason);
    }

    /**
     * Sprawdza, czy istnieje powód, by blokować nawigację
     */
    public static IsPrevented(){
        return this.Reasons.size != 0;
    }

    /**
     * Sprawdza, czy podany powód blokuje nawigację
     * @param reason Identyfikator powodu do sprawdzenia
     */
    public static IsPreventedBy(reason: string){
        return this.Reasons.has(reason);
    }

    /**
     * Usuwa wszystkie powody, które blokują nawigację
     */
    public static ClearReasons(){
        this.Reasons.clear();
    }
}