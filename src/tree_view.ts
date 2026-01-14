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
		return "Hierarchical TOC";
	}

  async onOpen() {
	plugin.set(this.plugin);

    this.component = new Component({
      target: this.contentEl
    });
  }

  async onClose() {
    this.component.$destroy();
  }

  getComponent()
  {
	return this.component;
  }
}
