# AGENTS.md

## Project overview

- Target: Obsidian Community Plugin (TypeScript → bundled JavaScript).
- Entry point: `main.ts` compiled to `main.js` and loaded by Obsidian.
- Required release artifacts: `main.js`, `manifest.json`, and optional `styles.css`.

## Plugin functionality

- Tree view sidebar panel.
- Display notes linked by parent relationships.
- Expects notes to have a YAML frontmatter field `parent` with the name of the parent note.

## Tree view

- Shows infered children of currently open note.
- Changing open note refreshes tree view.
- On refresh, tree view always starts collapsed.
- Uncolapsing a node shows its children by one level.

## Performance considerations

- Vaults can be large (1000s of notes).
- Tree view should be performant and not freeze UI.
- Use efficient data structures and algorithms for building and rendering the tree.
- Consider lazy loading or virtual scrolling if necessary.