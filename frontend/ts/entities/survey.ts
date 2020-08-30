import Entity from './entity';
import User from './user';

export default class Survey extends Entity {
    public Id: number;
    public Author: User;
    public Name: string;
    public Description: string | null;

    public constructor(id: number, author: User, name: string, description: string | null) {
        super();

        this.Id = id;
        this.Author = author;
        this.Name = name;
        this.Description = description;
    }
}