import Card from '../basic/card';
import HelpTopic from './help_topic';

export default class HelpTopicCard extends Card {

    constructor(topic: HelpTopic) {
        super();

        this.GetElement().id = topic.Identifier;

        let heading = document.createElement('h2');
        heading.textContent = topic.Title;
        this.AppendChild(heading);

        let content = document.createElement('div');
        this.AppendChild(content);
        content.innerHTML = topic.Body;
    }
}