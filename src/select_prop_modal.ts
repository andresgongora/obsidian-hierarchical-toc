import { SuggestModal, Notice } from 'obsidian';
import  HierarchicalTocPlugin  from 'main';

function get_link_base(link:string)
{
    /*
        [[link1]]
        [[link2|name]]
        [name](link3)
    */

    const regexp_1 = /(?:\[\[(.+?)\||\[\[(.+?)\]\]|\[.+?\]\((.+?)\))/;
    let result = null;
    const match = regexp_1.exec(link);

    if (match)
    {
        if (match[1]) result = match[1];
        if (match[2]) result = match[2];
        if (match[3]) result = match[3];
    }

    return result;
}

interface NoteLink
{
	name: string;
    full: string;
}

export class VF_SelectPropModal  extends SuggestModal<NoteLink>
{
    useMarkdownLinks: boolean;
    prop_list: string[];

	constructor(private plugin: HierarchicalTocPlugin, private yamlProp:string, private onSubmit: (result: string) => void)
	{
		super(plugin.app);
        this.app = plugin.app;
		this.useMarkdownLinks = ((this.app.vault as unknown as {getConfig: (key: string) => boolean}).getConfig('useMarkdownLinks'));
		this.setPlaceholder('Select one to remove');
	}

    open()
    {
		void this.plugin.yaml.get_links(this.yamlProp, (links)=>
		{
            if(links.length == 0)
			{
                // do nothig if empty prop list
                new Notice(`${this.yamlProp} is empty`)
				return;
			}

			if(links.length == 1)
			{
                // return immediately if only one link
                this.onSubmit(links[0]);
                return;
			}

            // redner list if multiple links
            super.open();
		});
    }

    async getSuggestions(_query: string): Promise<NoteLink[]>
    {
		const notes: NoteLink[] = [];
        const file = this.app.workspace.getActiveFile();

		if(file)
		{
			await this.app.fileManager.processFrontMatter(file, (fm) => {this._get_prop_list(fm, this.yamlProp); });

            for(const item of this.prop_list)
            {
                const name = get_link_base(item);
                if (!name) continue;
                notes.push({name:name, full:item})
            }
		}

        return notes;
    }

	getItemName(item: NoteLink)
	{
		return item.name;
	}

    renderSuggestion(item: NoteLink, el: HTMLElement)
    {
        el.createEl('div', {text: this.getItemName(item)});
    }

    onChooseSuggestion(item: NoteLink, _evt: MouseEvent | KeyboardEvent)
    {
        this.onSubmit(item.full);
    }

	_get_prop_list(front: Record<string, string[]>, prop: string)
	{
		if (prop in front && front[prop])
		{
            this.prop_list = front[prop];
		}
		else
		{
			this.prop_list = [];
		}
	}
}

