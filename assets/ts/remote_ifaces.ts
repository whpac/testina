export interface SaveQuestionXHR {
    test_id: number,
    question_id: number,
    text: string,
    type: number,
    points: number,
    points_counting: number,
    max_typos: number,
    answers: Array<{}>,
    removed_answers: Array<{}>
}

export interface SaveTestXHR {
    test_id: number,
    test_name: string
    question_multiplier: number,
    time_limit: number
}

export interface RemoveQuestionXHR {
    question_id: number
}

export interface RemoveTestXHR {
    test_id: number
}

export interface SaveTestResultsXHR {
    attempt_id: number,
    questions: number[][],
    question_ids: number[]
}