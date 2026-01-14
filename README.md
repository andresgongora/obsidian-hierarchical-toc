# Hierarchical TOC Plugin

A plugin for displaying child notes of the currently active note in a hierarchical tree view.

## About

This plugin is a fork of [obsidian-virt-folder](https://github.com/gr0grig/obsidian-virt-folder) by
gr0grig. I am very thankful to the original author for creating such a useful foundation.

**Key Difference**: While the original Virtual Folder plugin provides an overview of your entire vault's hierarchical structure, this plugin is modified to serve as a **Table of Contents (TOC) for the currently active note**. It displays only the child notes of the active note, not the entire vault hierarchy.

## How It Works

The plugin shows a tree view in the sidebar that displays notes linked by parent-child
relationships:

- Notes should have a YAML frontmatter field `parent` with the name of the parent note
- When you open a note, the tree view automatically refreshes to show its children
- You can expand nodes to see their children one level at a time
- The tree view starts collapsed on each refresh

## Further Reading

For a comprehensive understanding of hierarchical note structures and the original plugin's
capabilities, please refer to:

- [Original Virtual Folder plugin](https://github.com/gr0grig/obsidian-virt-folder/)
- [Virtual Folder documentation on GitBook](https://virtfolder.gitbook.io/index)
