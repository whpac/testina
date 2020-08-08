import Entity from '../entity';

export default interface Loader<EntityType extends Entity> {

    LoadById(entity_id: number): Promise<EntityType>;
    LoadById(entity_ids: number[]): Promise<EntityType[]>;
}