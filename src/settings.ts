import { App, PluginSettingTab, Setting, TextAreaComponent, TextComponent, DropdownComponent, ToggleComponent } from 'obsidian';
import HierarchicalTocPlugin  from './main';

export enum SortTypes
{
    file_name = "file_name",
    note_title = "note_title",
	creation_time = "creation_time",
	modification_time = "modification_time",
};

export interface HierarchicalTocSettings
{
	ignorePath: string;
	propertyName: string;
	cmdShowTitle: boolean;
	sortTreeBy: SortTypes;
	sortTreeRev: boolean;
	UseWikiLinks: boolean;
	showChildCount: boolean;
	autoExpandTree: boolean;
	autoExpandDepth: number;
}

export const DEFAULT_SETTINGS: Partial<HierarchicalTocSettings> =
{
	ignorePath: '',
	propertyName: 'up',
	cmdShowTitle: false,
	sortTreeBy: SortTypes.file_name,
	sortTreeRev: false,
	UseWikiLinks: true,
	showChildCount: true,
	autoExpandTree: false,
	autoExpandDepth: 0,
};

export class HierarchicalTocSettingTab extends PluginSettingTab
{
	plugin: HierarchicalTocPlugin;
	counter: TextComponent;

	constructor(app: App, plugin: HierarchicalTocPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.init_settings();
	}

	init_settings()
	{
		this.update_filter(this.plugin.settings.ignorePath);
		this.update_prop_name(this.plugin.settings.propertyName);
	}

	display(): void
	{
		let { containerEl } = this;
		containerEl.empty();

		// validate on change !!

		new Setting(containerEl)
		.setName("YAML for  note's folders")
		.setDesc("The name can contain letters, numbers, minus sign, underscore and dots")
		.addText((text: TextComponent) =>
		{
			text.setValue(this.plugin.settings.propertyName);
			text.setPlaceholder('up')
			text.onChange(async (value) =>
			{
				let style = text.inputEl.style;

				if(this.is_valid_prop_name(value))
				{
					style.borderColor = '';

					this.plugin.settings.propertyName = value;
					await this.plugin.saveSettings();

					this.update_prop_name(value);
				}else{
					style.borderColor = this.get_css_var('--background-modifier-error');
				}
			});
		});


		new Setting(containerEl)
		.setName("Use title in commands")
		.setDesc("Display note's title instead of file name when displaying command results")
		.addToggle( (tg:ToggleComponent) =>
		{
			tg.setValue(this.plugin.settings.cmdShowTitle);
			tg.onChange(async (value) =>
			{
				this.plugin.settings.cmdShowTitle = value;
				await this.plugin.saveSettings();
			});
		});


		new Setting(containerEl)
		.setName("Sorting")
		.setDesc("Note sorting criteria in the tree view")
		.addDropdown( (dc:DropdownComponent) =>
		{
			for(let key of Object.keys(SortTypes))
			{
				dc.addOption(key, key);
			}

			dc.setValue(this.plugin.settings.sortTreeBy);

			dc.onChange(async (value) =>
			{
				this.plugin.settings.sortTreeBy = SortTypes[value as keyof typeof SortTypes];
				await this.plugin.saveSettings();
				this.update_note_list();
			});
		});


		new Setting(containerEl)
		.setName("Reverse sort order")
		.addToggle( (tg:ToggleComponent) =>
		{
			tg.setValue(this.plugin.settings.sortTreeRev);
			tg.onChange(async (value) =>
			{
				this.plugin.settings.sortTreeRev = value;
				await this.plugin.saveSettings();
				this.update_note_list();
			});
		});


		new Setting(containerEl)
		.setName("List of ignored paths")
		.setDesc("Each line is interpreted as the start of an ignored path")
		.addTextArea((textArea: TextAreaComponent) =>
		{
			textArea
				.setValue(this.plugin.settings.ignorePath)
				.setPlaceholder('Enter one or more paths relative to the archive root')
				.onChange(async (value) =>
				{
					this.plugin.settings.ignorePath = value;
					await this.plugin.saveSettings();

					this.update_filter(value);
					this.update_counter();
					this.update_note_list();
				});

			textArea.inputEl.setAttr("rows", 6);
			textArea.inputEl.setAttr("cols", 40);
		});


		new Setting(containerEl)
		.setName("Ignored files")
		.addText((text: TextComponent) =>
		{
			text.setValue('0').setDisabled(true);
			this.counter = text;
		});

		this.update_counter();


		new Setting(containerEl)
		.setName("Use [[WikiLinks]] in YAML")
		.addToggle( (tg:ToggleComponent) =>
		{
			tg.setValue(this.plugin.settings.UseWikiLinks);
			tg.onChange(async (value) =>
			{
				this.plugin.settings.UseWikiLinks = value;
				await this.plugin.saveSettings();
				this.update_note_list();
			});
		});


		new Setting(containerEl)
		.setName("Show child count in tree")
		.setDesc("Display the number of children next to each tree node")
		.addToggle( (tg:ToggleComponent) =>
		{
			tg.setValue(this.plugin.settings.showChildCount);
			tg.onChange(async (value) =>
			{
				this.plugin.settings.showChildCount = value;
				await this.plugin.saveSettings();
				this.update_show_child_count();
			});
		});


		new Setting(containerEl)
		.setName("Auto-expand tree")
		.setDesc("Show fully expanded tree when changing active note")
		.addToggle( (tg:ToggleComponent) =>
		{
			tg.setValue(this.plugin.settings.autoExpandTree);
			tg.onChange(async (value) =>
			{
				this.plugin.settings.autoExpandTree = value;
				await this.plugin.saveSettings();
				this.update_auto_expand();
			});
		});


		new Setting(containerEl)
		.setName("Auto-expand depth limit")
		.setDesc("If auto expand ON, maximum expansion depth (0 = expand all, positive number = limit depth)")
		.addText((text: TextComponent) =>
		{
			text.setValue(this.plugin.settings.autoExpandDepth.toString());
			text.setPlaceholder('0')
			text.onChange(async (value) =>
			{
				let style = text.inputEl.style;
				const numValue = parseInt(value);

				if(!isNaN(numValue) && numValue >= 0)
				{
					style.borderColor = '';
					this.plugin.settings.autoExpandDepth = numValue;
					await this.plugin.saveSettings();
					this.update_auto_expand();
				}else{
					style.borderColor = this.get_css_var('--background-modifier-error');
				}
			});
			text.inputEl.type = 'number';
			text.inputEl.min = '0';
		});

	}

	update_counter()
	{
		let count = this.plugin.base.get_filtred_count();
		this.counter.setValue(count.toString());
	}

	update_note_list()
	{
		this.plugin.base.rescan();
		this.plugin.update_data();
	}

	update_filter(value:string)
	{
		let filter = this.parse_text_area(value);
		this.plugin.base.settings.set_filter(filter);
	}

	parse_text_area(value:string)
	{
		return value.split(/\r|\n/).map(n => n.trim()).filter(n=>n);
	}

	is_empty_str(name:string): boolean
	{
		return name === '';
	}

	is_valid_prop_name(name:string): boolean
	{
		let regexp = /^[\w.-]+$/;
		return regexp.test(name);
	}

	update_prop_name(name:string)
	{
		if (!this.is_valid_prop_name(name))	return;
		this.plugin.base.settings.set_prop(name);
		this.update_note_list();
	}

	update_show_child_count()
	{
		this.plugin.update_data();
	}

	update_auto_expand()
	{
		this.plugin.update_data();
	}

	get_css_var(variable:string)
	{
		let el = document.querySelector('body');
		if (!el) return '';

		let style = window.getComputedStyle(el);
		if (!style) return '';

		return style.getPropertyValue(variable);
	}
}