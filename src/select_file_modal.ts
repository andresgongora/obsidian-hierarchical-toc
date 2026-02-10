import { FuzzySuggestModal, FuzzyMatch } from 'obsidian';
import { OneNote } from 'onenote';
import  HierarchicalTocPlugin  from 'main';

interface ShowedItem
{
	id: string;
	name: string;
	title: string;
	parents: string[];
	utime: number;
}

export class VF_SelectFile extends FuzzySuggestModal<ShowedItem>
{
	selected = '';

	constructor(private plugin: HierarchicalTocPlugin, private onSubmit: (result: string) => void)
	{
		super(plugin.app);
		this.setPlaceholder('Type note\'s title');
	}

	getAliases(_note: OneNote)
	{
		// next time
	}

	getItemName(item: ShowedItem)
	{
		return item.name;
	}

	getItemText(item: ShowedItem): string
	{
		return this.getItemName(item);
	}

	getItems(): ShowedItem[]
	{
		const notes: ShowedItem[] = [];

		for (const id in this.plugin.base.note_list)
		{
			notes.push(this.plugin.base.note_list[id]);
		}

		// sort with update time
		notes.sort(function(a,b){ return b.utime - a.utime});
		return notes;
	}

	onChooseItem(item: ShowedItem, _evt: MouseEvent | KeyboardEvent): void
	{
		this.onSubmit(item.id);
	}

	_format_parents(parents: string[])
	{
		const links = [];

		for (const id of parents)
		{
			const note = this.plugin.base.note_by_id(id);
			if(!note) continue;
			links.push(this.getItemName(note));
		}

        return links;
	}

	renderSuggestion(item: FuzzyMatch<ShowedItem>, el: HTMLElement): void
	{
		el.createEl('div', {text: this.getItemName(item.item)});
        const small = el.createEl('small', {cls: 'vf_search_parents'});

        for(const parent of item.item.parents)
        {
            const path: string[] | undefined = this.plugin.base.get_shortest_path(parent);
            if (!path) continue;
            const links = this._format_parents(path);
            const line = small.createEl('div', {cls:'vf_serach_div'});

            for(const id of links)
            {
                line.createEl('span', {text: id, cls: 'vf_serach_link'});
            }
        }
	}
}
