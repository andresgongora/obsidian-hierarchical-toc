import { TAbstractFile, Plugin, TFile } from 'obsidian';
import { WorkspaceLeaf } from "obsidian";
import { data, active_id, centered_id, centered_children, show_child_count, auto_expand_tree, auto_expand_depth } from './components/stores';
import { NoteData } from './data';
import { BaseScanner } from './base_scanner';
import { VIEW_TYPE_VF, HierarchicalTocView as HierarchicalTocView } from './tree_view';
import { YamlParser } from './yaml_parser';
import { HierarchicalTocSettingTab, HierarchicalTocSettings, DEFAULT_SETTINGS } from './settings';

export default class HierarchicalTocPlugin extends Plugin
{
	data: NoteData;
	base: BaseScanner;
	yaml: YamlParser;
	settings: HierarchicalTocSettings;
	private resolveTimer: ReturnType<typeof setTimeout> | null = null;

	async onload()
	{
		await this.loadSettings(); // order is important

		this.base = new BaseScanner(this.app, this);
		this.data = new NoteData(this.base);
		this.yaml = new YamlParser(this.app, this);

		this.addSettingTab(new HierarchicalTocSettingTab(this.app, this));

		this.registerView(
			VIEW_TYPE_VF,
			(leaf) => new HierarchicalTocView(leaf, this)
		  );

		// add cmd - pin folder (icon='folder-heart')

		this.addCommand({
			id: "open_tree_view",
			name: "Show tree",
			icon: "folder-tree",
			callback: () => {
			  void this.VF_OpenTreeView();
			},
		});

		this.app.workspace.onLayoutReady(() =>
		{
			// reactive
			this.data.onStartApp();
			this.update_data();

			this.registerEvent(this.app.metadataCache.on("resolve", this.onResolveMetadata));
			this.registerEvent(this.app.workspace.on("file-open", this.onOpenFile, this));
			this.registerEvent(this.app.vault.on("create", this.onCreateFile));
			this.registerEvent(this.app.vault.on("delete", this.onDeleteFile));
			this.registerEvent(this.app.vault.on("rename", this.onRenameFile));
		});

		this.register(() =>
		{
			if(this.resolveTimer !== null) clearTimeout(this.resolveTimer);
		});
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	updateActiveFile()
	{
		const file = this.app.workspace.getActiveFile();
		if(file) {
			active_id.set(file.path);
			centered_id.set(file.path);
			// Get children of the centered note
			const children = this.base.get_children_for_note(file.path);
			centered_children.set(children);
		}
		else {
			active_id.set('');
			centered_id.set('');
			centered_children.set([]);
		}
	}

	setActiveFile(file: TFile | null)
	{
		if(file instanceof TFile)
		{
			active_id.set(file.path);
			centered_id.set(file.path);
			// Get children of the centered note
			const children = this.base.get_children_for_note(file.path);
			centered_children.set(children);
		}else{
			active_id.set('');
			centered_id.set('');
			centered_children.set([]);
		}
	}

	update_data()
	{
		data.set(this.base);
		show_child_count.set(this.settings.showChildCount);
		auto_expand_tree.set(this.settings.autoExpandTree);
		auto_expand_depth.set(this.settings.autoExpandDepth);
		this.updateActiveFile();
	}

	onOpenFile = (file: TFile | null) =>
	{
		this.setActiveFile(file);
	};

	onCreateFile = (file: TAbstractFile) =>
	{
		if(file instanceof TFile)
		{
			this.data.onCreate();
			this.update_data();
		}
	};

	onDeleteFile = (file: TAbstractFile) =>
	{
		// file can be TFolder or TFile
		if(file instanceof TFile)
		{
			this.data.onDelete();
			this.update_data();
		}
	};

	onRenameFile = (file: TAbstractFile, oldPath: string) =>
	{
		if(file instanceof TFile)
		{
			// carry utime forward: rescan keys notes by new path, so the
			// old id would otherwise be lost and utime reset to 0
			const oldUtime = this.base.note_by_id(oldPath)?.utime;

			this.data.onRename();
			this.update_data();

			if(oldUtime !== undefined)
			{
				const renamed = this.base.note_by_id(file.path);
				if(renamed) renamed.utime = oldUtime;
			}
		}
	};

	onResolveMetadata = (file: TFile) =>
	{
		if (this.base.is_same_mtime(file))
		{
			return;
		}

		// debounce: metadataCache fires "resolve" per file; a large vault
		// startup can emit thousands of events, each triggering a full
		// rescan. Coalesce bursts into a single rescan.
		if(this.resolveTimer !== null)
		{
			clearTimeout(this.resolveTimer);
		}

		this.resolveTimer = setTimeout(() =>
		{
			this.resolveTimer = null;
			this.data.onChange();
			this.update_data();
		}, 200);
	};

	revealFile(path: string[])
	{
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE_VF))
		{
			if (!(leaf.view instanceof HierarchicalTocView)) continue;
			leaf.view.component.focusTo(path);
		}
	}

	async activateView()
	{
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_VF);

		if (leaves.length > 0) {
		  // A leaf with our view already exists, use that
		  leaf = leaves[0];
		} else {
		  // Our view could not be found in the workspace, create a new leaf
		  // in the right sidebar for it
		  leaf = workspace.getLeftLeaf(false);
		  if (leaf) await leaf.setViewState({ type: VIEW_TYPE_VF, active: true });
		}

		// "Reveal" the leaf in case it is in a collapsed sidebar
		if (leaf) await workspace.revealLeaf(leaf);
	}

	async VF_OpenTreeView()
	{
		await this.activateView();
	}

	updateUsedTime(file_id:string)
    {
        const note = this.base.note_by_id(file_id);
        if(note) note.utime = Date.now();
    }
}
