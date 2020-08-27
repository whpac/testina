/** 
 * Interfejs opisujący obiekt przekazywany jako parametr do strony,
 * z możliwością zapisania w pamięci podręcznej przeglądarki
 */
export default interface PageParams {
    
    /** Zwraca prostą reprezentację obiektu, do zapisania w historii przeglądarki */
    GetSimpleRepresentation(): SimpleObjectRepresentation;
}

/** Reprezentacja obiektu przechowująca jego typ i identyfikator */
export type SimpleObjectRepresentation = {
    type: string,
    id: number
}