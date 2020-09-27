import Entity from '../entity';
import Assignment from '../assignment';
import Attempt from '../attempt';
import Test from '../test';
import Question from '../question';
import Answer from '../answer';
import User from '../user';
import Group from '../group';

export default class ApiEndpoints {
    public static readonly SurveyFillUrlBeginning = 'http://localhost/p/ankiety/wypełnij/';

    public static GetEntityUrl(entity: Entity) {
        if(entity instanceof Assignment) {
            return this.GetAssignmentUrl(entity);
        } else if(entity instanceof Attempt) {
            return this.GetAttemptUrl(entity);
        }

        if(entity instanceof Test) {
            return this.GetTestUrl(entity);
        } else if(entity instanceof Question) {
            return this.GetQuestionUrl(entity);
        } else if(entity instanceof Answer) {
            return this.GetAnswerUrl(entity);
        }

        if(entity instanceof User) {
            return this.GetUserUrl(entity);
        } else if(entity instanceof Group) {
            return this.GetGroupUrl(entity);
        }

        let name = entity.constructor?.name ?? typeof entity;
        throw `Obiekt ${name} nie ma reprezentacji w API.`;
    }

    protected static GetAssignmentUrl(assignment: Assignment) {
        return `api/assignments/${assignment.Id}`;
    }

    protected static GetAttemptUrl(attempt: Attempt) {
        return this.GetAssignmentUrl(attempt.Assignment) + `/attempts/${attempt.Id}`;
    }

    protected static GetTestUrl(test: Test) {
        if(test.Type == Test.TYPE_SURVEY) return `api/surveys/${test.Id}`;
        return `api/tests/${test.Id}`;
    }

    protected static GetQuestionUrl(question: Question) {
        return this.GetTestUrl(question.Test) + `/questions/${question.Id}`;
    }

    protected static GetAnswerUrl(answer: Answer) {
        return this.GetQuestionUrl(answer.Question) + `/answers/${answer.Id}`;
    }

    protected static GetUserUrl(user: User) {
        return `api/users/${user.Id}`;
    }

    protected static GetGroupUrl(group: Group) {
        return `api/groups/${group.Id}`;
    }
}