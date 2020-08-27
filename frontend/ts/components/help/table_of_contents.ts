import Card from '../basic/card';
import HelpTopic from './help_topic';

export default class TableOfHelpContents extends Card {

    constructor(topics: HelpTopic[]) {
        super();

        let heading = document.createElement('h2');
        this.AppendChild(heading);
        heading.textContent = 'Spis treści';

        let topic_list = document.createElement('ul');
        this.AppendChild(topic_list);

        for(let topic of topics) {
            let list_entry = document.createElement('li');
            topic_list.appendChild(list_entry);

            let list_link = document.createElement('a');
            list_entry.appendChild(list_link);
            list_link.href = 'pomoc#' + topic.Identifier;
            list_link.textContent = topic.Title;
        }
    }
}