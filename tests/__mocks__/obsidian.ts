// Minimal Obsidian API mock for unit tests. Only exports actually used at
// runtime (as values) by tested modules need real behavior; the rest are
// type-only imports erased by tsc and don't need to exist here.

export class Notice
{
    message: string;

    constructor(message: string)
    {
        this.message = message;
    }
}

export class TFile
{
    path = '';
    basename = '';
    stat = { mtime: 0, ctime: 0 };
}

export class App
{
    vault: any = {};
    metadataCache: any = {};
    workspace: any = {};
    fileManager: any = {};
}

export class Plugin {}
export class PluginSettingTab {}
export class Setting {}
export class TextAreaComponent {}
export class TextComponent {}
export class DropdownComponent {}
export class ToggleComponent {}
export class FuzzySuggestModal {}
export class SuggestModal {}
export class TAbstractFile {}
export class FuzzyMatch {}
