import Page from '../components/basic/page';
import HelpTopic from '../components/help/help_topic';
import TableOfHelpContents from '../components/help/table_of_contents';
import HelpTopicCard from '../components/help/help_topic_card';

export default class HelpPage extends Page {

    constructor() {
        super();

        let heading = document.createElement('h1');
        heading.textContent = 'Pomoc';
        this.AppendChild(heading);

        let help_topics = HelpTopic.GetTopics();

        this.AppendChild(new TableOfHelpContents(help_topics));

        for(let topic of help_topics) {
            this.AppendChild(new HelpTopicCard(topic));
        }
    }

    async LoadInto(container: HTMLElement, params?: any): Promise<void> {
        container.appendChild(this.Element);
    }

    UnloadFrom(container: HTMLElement): void {
        container.removeChild(this.Element);
    }

    GetUrlPath(): string | null {
        return 'pomoc';
    }

    async GetTitle(): Promise<string> {
        return 'Pomoc';
    }

}