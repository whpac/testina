import TestLoader from '../entities/loaders/testloader';
import AssignmentLoader from '../entities/loaders/assignmentloader';
import AttemptLoader from '../entities/loaders/attemptloader';

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
    id: number | string;
};

/**
 * Tworzy obiekt z prostej reprezentacji
 * @param params Prosta reprezentacja obiektu
 */
export async function UnserializeParams(params?: SimpleObjectRepresentation): Promise<(PageParams | undefined)> {
    switch(params?.type) {
        case 'test': return await TestLoader.LoadById(params.id);
        case 'assignment': return await AssignmentLoader.LoadById(params.id);
        case 'attempt': return await AttemptLoader.LoadById(typeof params.id == 'number' ? params.id : parseInt(params.id));
    }
    return undefined;
}