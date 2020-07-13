export default interface PageParams {
    
    GetSimpleRepresentation(): SimpleObjectRepresentation;
}

type SimpleObjectRepresentation = {
    type: string,
    id: number
}