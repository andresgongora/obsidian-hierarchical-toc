import { ItemView, WorkspaceLeaf } from "obsidian";
import Component from "./components/Component.svelte";
import { plugin } from './components/stores';
import HierarchicalTocPlugin  from './main';

export const TREE_ICON = "folder-tree";
export const VIEW_TYPE_VF = "hierarchical-toc-view";

export class HierarchicalTocView extends ItemView
{
	component: Component;
	icon = TREE_ICON;

	constructor(leaf: WorkspaceLeaf, private plugin: HierarchicalTocPlugin) {
		super(leaf);
	}

	getViewType() {
		return VIEW_TYPE_VF;
	}

	getDisplayText() {
		// eslint-disable-next-line obsidianmd/ui/sentence-case -- ToC is an acronym for Table of Contents
		return "Hierarchical ToC";
	}

  // eslint-disable-next-line @typescript-eslint/require-await -- Base class requires async signature but implementation has no async operations
  async onOpen() {
	plugin.set(this.plugin);

    this.component = new Component({
      target: this.contentEl
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await -- Base class requires async signature but implementation has no async operations
  async onClose() {
    this.component.$destroy();
  }

  getComponent()
  {
	return this.component;
  }
}
