# Hierarchical TOC Plugin

A plugin for displaying child notes of the currently active note in a hierarchical tree view.

## About

This plugin is a fork of [obsidian-virt-folder](https://github.com/gr0grig/obsidian-virt-folder) by
gr0grig. I am very thankful to the original author for creating such a useful foundation.

**Key Difference**: While the original Virtual Folder plugin provides an overview of your entire
vault's hierarchical structure, this plugin is modified to serve as a **Table of Contents (TOC) for
the currently active note**. It displays only the child notes of the active note, not the entire
vault hierarchy.

## How It Works

The plugin shows a tree view in the sidebar that displays notes linked by parent-child
relationships:

- Notes should have a YAML frontmatter field `parent` with the name of the parent note
- When you open a note, the tree view automatically refreshes to show its children
- You can expand nodes to see their children one level at a time
- The tree view starts collapsed on each refresh

## Example

### Complete Vault Hierarchy

Here's a comprehensive example showing the complete hierarchical structure of a vault. Note that
**each note may have more than one parent** (notice for eaxmple `F`), creating a flexible knowledge
graph rather than a strict tree. Also note that this relationship **is note defined by folder
structure** but rather by the `parent` field in each note's frontmatter.

```text
A
├── B
│   ├── E
│   │   ├── I
│   │   │   └── M
│   │   └── J
│   │       └── M
│   └── F
│       └── K
├── C
│   ├── F
│   │   └── K
│   ├── G
│   │   └── K
│   │       └── N
│   └── H
└── D
    ├── G
    │   └── K
    │       └── N
    └── H
        └── L
            └── N
```

### Active Note View

When you open a specific note in Hierarchical TOC, **only its children are displayed**. For example,
if note **C** is the active note, the tree view would show:

```
C (active)
├── F
│   └── K
├── G
│   └── K
│       └── N
└── H
```

This focused view helps you navigate the immediate descendants of your current note, making it
easier to explore your knowledge base one level at a time without being overwhelmed by the entire
vault structure.

## Further Reading

For a comprehensive understanding of hierarchical note structures and the original plugin's
capabilities, please refer to:

- [Original Virtual Folder plugin](https://github.com/gr0grig/obsidian-virt-folder/)
- [Virtual Folder documentation on GitBook](https://virtfolder.gitbook.io/index)
