import { App, Notice} from 'obsidian';
import HierarchicalTocPlugin from './main';

export class YamlParser
{
	constructor(private app: App, private plugin: HierarchicalTocPlugin)
	{

	}

    showMessage(msg: string)
	{
		new Notice(msg);
	}

    _fm_add_link(front: Record<string, string[]>, selected: string, prop: string)
    {
        const file = this.app.vault.getFileByPath(selected);
        if(!file) return;

        const link = this.app.metadataCache.fileToLinktext(file, '');
        let formated_link = `[[${link}]]`;

        if(!this.plugin.settings.UseWikiLinks)
        {
            formated_link = `[${link}](${link})`;
        }

        // add link to Folders
        if (prop in front && front[prop])
        {
            // check wiki and md ?
            if(front[prop].contains(formated_link))
            {
                this.showMessage(`${prop}'s link already exist`);
                return;
            }
        }
        else
        {
            front[prop] = [];
        }

        front[prop].push(formated_link);
        this.showMessage(`Set ${prop}: ${link}`);
    }

    async add_link(yamlProp:string, file_id:string)
    {
        const file = this.app.workspace.getActiveFile();
        if(!file) return;
        try
        {
            await this.app.fileManager.processFrontMatter(file, (fm) => { this._fm_add_link(fm, file_id, yamlProp); });
        }
        catch(err)
        {
            this.showMessage(`Failed to update ${yamlProp}: ${err}`);
        }
    }

    _fm_replace_link(front: Record<string, string[]>, selected: string, prop: string, old_link:string)
    {
        const file = this.app.vault.getFileByPath(selected);
        if(!file) return;

        const link = this.app.metadataCache.fileToLinktext(file, '');
        let formated_link = `[[${link}]]`;

        if(!this.plugin.settings.UseWikiLinks)
        {
            formated_link = `[${link}](${link})`;
        }

        if (prop in front && front[prop])
        {
            if(front[prop].contains(formated_link))
            {
                this.showMessage(`${prop}'s link already exist`);
                return;
            }

            if(!front[prop].contains(old_link))
            {
                this.showMessage(`Can't find ${old_link} in ${prop}`);
                return;
            }

            const i = front[prop].indexOf(old_link);
            front[prop][i] = formated_link;
            this.showMessage(`Set ${prop}: ${link}`);
        }
        else
        {
            this.showMessage(`Can't find ${old_link}: ${prop} is empty`);
        }
    }

    async replace_link(yamlProp:string, old_link:string, file_id:string)
    {
        const file = this.app.workspace.getActiveFile();
        if(!file) return;
        try
        {
            await this.app.fileManager.processFrontMatter(file, (fm) => { this._fm_replace_link(fm, file_id, yamlProp, old_link); });
        }
        catch(err)
        {
            this.showMessage(`Failed to update ${yamlProp}: ${err}`);
        }
    }

    _fm_get_links(front: Record<string, string[]>, prop: string)
    {
        if (prop in front && front[prop])
        {
            return front[prop]
        }
        else
        {
            return [];
        }
    }

    async get_links(yamlProp:string, callback: (result: string[]) => void)
    {
        const file = this.app.workspace.getActiveFile();
        if(!file) return;
        try
        {
            await this.app.fileManager.processFrontMatter(file, (fm) => { callback(this._fm_get_links(fm, yamlProp)); });
        }
        catch(err)
        {
            this.showMessage(`Failed to read ${yamlProp}: ${err}`);
        }
    }

    _fm_remove_link(front: Record<string, string[]>, prop: string, old_link:string)
    {
        if (prop in front && front[prop])
        {
            if (front[prop].contains(old_link))
            {
                front[prop].remove(old_link);
                this.showMessage(`${prop}'s link removed`);
            }
            else
            {
                this.showMessage(`${prop}'s link not exist`);
            }
        }
    }

    async remove_link(yamlProp:string, old_link:string)
    {
        const file = this.app.workspace.getActiveFile();
        if(!file) return;
        try
        {
            await this.app.fileManager.processFrontMatter(file, (fm) => { this._fm_remove_link(fm, yamlProp, old_link); });
        }
        catch(err)
        {
            this.showMessage(`Failed to update ${yamlProp}: ${err}`);
        }
    }
};




