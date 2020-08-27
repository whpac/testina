export default class HelpTopic {

    public constructor(
        public Title: string,
        public Identifier: string,
        public Body: string) {

    }

    public static GetTopics() {
        return [
            new HelpTopic(
                'Edycja pytań', 'edycja_pytan',
                ``
            ),
            new HelpTopic(
                'Liczenie punktów', 'liczenie_punktow',
                ``
            ),
            new HelpTopic(
                'Mnożnik pytań', 'mnoznik_pytan',
                ``
            ),
            new HelpTopic(
                'Limit czasu – w teście a w przypisaniu', 'limit_czasu',
                ``
            )
        ];
    }
}