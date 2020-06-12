export type TestDescriptor = {
    attempt_id: number,
    test_name: string,
    time_limit: number,
    total_points: number,
    questions: QuestionList,
    path: number[]
};

export type QuestionList = {
    [question_id: number]: QuestionDescriptor
};

export type QuestionDescriptor = {
    id: number,
    text: string,
    type: number,
    points: number,
    points_counting: number,
    answers: AnswerDescriptor[],
    max_typos: number,
    persistent: boolean,
    number?: number
};

export type AnswerDescriptor = {
    id: number,
    text: string,
    correct: boolean,
    index?: number
};

export type UserAnswerDescriptor = {
    done: boolean,
    [answer_index: number]: boolean
};

export type ResultsDescriptor = {
    [question_id: number]: {
        got: number,
        max: number
    }
};