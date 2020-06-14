export default class Test {
    protected id: number;
    protected name: string | undefined;
    protected author_id: number | undefined;
    protected creation_date: Date | undefined;
    protected time_limit: number | undefined;
    protected question_multiplier: number | undefined;

    constructor(id: number){
        this.id = id;
        // fetch();
    }

    GetId(){
        return this.id;
    }

    GetName(){
        return this.name;
    }

    GetAuthor(){
        return this.author_id;
    }

    GetCreationDate(){
        return this.creation_date;
    }

    GetTimeLimit(){
        return this.time_limit;
    }

    GetQuestionMultiplier(){
        return this.question_multiplier;
    }
}