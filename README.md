# Hierarchical TOC

[![GitHub release](https://img.shields.io/github/v/release/andresgongora/obsidian-hierarchical-toc)](https://github.com/andresgongora/obsidian-hierarchical-toc/releases)
[![Obsidian minAppVersion](https://img.shields.io/badge/obsidian-%E2%89%A50.15.0-7c3aed)](https://obsidian.md)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy_Me_A_Coffee-tip-yellow)](https://buymeacoffee.com/andresgongora)

Hierarchical TOC is an Obsidian plugin that shows the children of your current note in a sidebar
tree, built from a `parent` field in each note's frontmatter. Open any note and its immediate
children appear one level at a time, so you can navigate a knowledge graph without folders dictating
its shape.

<!------------------------------------------------------------------------------------------------->
## How It Works
<!------------------------------------------------------------------------------------------------->

Add a `parent` field to a note's YAML frontmatter naming its parent note:

```yaml
---
parent: "Project Overview"
---
```

Open the tree view in the sidebar and it refreshes to the active note automatically. A note may
list more than one parent, so the structure is a graph, not a strict tree — one note can appear
under several branches at once. This relationship comes entirely from the `parent` field, not from
folder location.

Consider a vault with these relationships:

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

Note `F` appears under both `B` and `C` — it has two parents. Open note `C` and the tree view shows
only its direct descendants:

```text
C (active)
├── F
│   └── K
├── G
│   └── K
│       └── N
└── H
```

Expand any node to reveal its children one level further. The tree always starts collapsed on
refresh, so large vaults stay readable.

<!------------------------------------------------------------------------------------------------->
## Configuration
<!------------------------------------------------------------------------------------------------->

Go to Settings → Hierarchical TOC to manage these options:

| Field | Description |
| ----- | ----------- |
| YAML for note's folders | Frontmatter property name that stores the parent (default: `up`) |
| Sorting | Sort by: file name, title, created, or modified |
| Reverse sort order | Invert the chosen sort order |
| List of ignored paths | One path per line; notes under these paths are excluded from the tree |
| Ignored files | Read-only count of notes currently excluded by the ignored-paths list |
| Use wikilinks in YAML | Store parent as wikilink instead of plain text |
| Show child count in tree | Display the number of children next to each tree node |
| Auto-expand tree | Show the tree fully expanded when the active note changes |
| Auto-expand depth limit | Maximum expansion depth when auto-expand is on; `0` expands all levels |

<!------------------------------------------------------------------------------------------------->
## Installation
<!------------------------------------------------------------------------------------------------->

### Using BRAT

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) from Community Plugins.
2. Run command: **BRAT: Add a beta plugin for testing**.
3. Enter: `https://github.com/andresgongora/obsidian-hierarchical-toc`.
4. Enable the plugin in Settings → Community plugins.

BRAT keeps the plugin updated with the latest changes in the repository.

### Manual Installation

1. Download the latest release from the [releases page](https://github.com/andresgongora/obsidian-hierarchical-toc/releases).
2. Extract the files into `<vault>/.obsidian/plugins/hierarchical-toc/`.
3. Reload Obsidian.
4. Enable the plugin in Settings → Community plugins.

<!------------------------------------------------------------------------------------------------->
## Privacy
<!------------------------------------------------------------------------------------------------->

This plugin makes no network calls, collects no telemetry, and does not access files outside your
vault. It reads note frontmatter to build the tree and stores your plugin settings locally via
Obsidian's plugin data.

<!------------------------------------------------------------------------------------------------->
## Origin
<!------------------------------------------------------------------------------------------------->

Hierarchical TOC was initially scaffolded from [Virtual Folder](https://github.com/gr0grig/obsidian-virt-folder)
by gr0grig, but has diverged significantly. The original plugin renders your entire vault's hierarchy
as a virtual folder tree; Hierarchical TOC narrows that view to a table of contents for the active note,
showing only its children instead of the whole vault, with a different data model and UI.

Further reading on the parent structure this plugin builds on:

- [Virtual Folder plugin](https://github.com/gr0grig/obsidian-virt-folder/)
- [Virtual Folder documentation](https://virtfolder.gitbook.io/index)

<!------------------------------------------------------------------------------------------------->
## Donations
<!------------------------------------------------------------------------------------------------->

If you like this project and want to show your support,
[buy me a coffee](https://buymeacoffee.com/andresgongora). Caffeine goes in, code comes out.

<!------------------------------------------------------------------------------------------------->
## License
<!------------------------------------------------------------------------------------------------->

MIT License. See [LICENSE](LICENSE) for details.
