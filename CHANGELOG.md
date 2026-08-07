# CHANGELOG

## [Unreleased]

## [1.0.10]

- Fix: `updateUsedTime` no longer throws on missing note id.
- Fix: rename preserves `utime` (used/created marker) instead of resetting it.
- Fix: debounce `metadataCache "resolve"` handling to avoid full-graph rescans on large-vault startup.
- Fix: dedup repeated `[[link]]` entries in frontmatter parent/child links.
- Fix: mutually-cyclic `parent` chains now warn via Notice instead of silently
  vanishing from the tree.
- Fix: YAML frontmatter link helpers (`add_link`/`replace_link`/`get_links`/`remove_link`)
  handle `processFrontMatter` rejection instead of leaving it unhandled.
- Fix: `replace_link` no longer silently blanks the prop when it's absent; reports it instead.
- Fix: tree view `focusTo` guards against a missing child node.
- Fix: `scrollIntoMiddle` used `myElement.win` (undefined) instead of `window`.
- Add: unit test suite (Jest) covering `base_scanner.ts`, `onenote.ts`, `yaml_parser.ts`,
  `data.ts`, `settings.ts`.
- Docs: rewritten README, refreshed AGENTS.md, added local deploy command reference.

## [1.0.9]

- Undo suppressions.

## [1.0.8]

- Suppress sentence case linting warnings for literal text in UI components.

## [1.0.7]

- Lint.

## [1.0.6]

- Lint.

## [1.0.5]

- Fix counter style.
- Lint.

## [1.0.4]

- Update description in manifest.json.

## [1.0.3]

- Update License dates.
- Update dependencies.

## [1.0.2]

- Remove vestigial settings.

## [1.0.1]

- First release of Hierarchical TOC plugin.

## [1.0.0]

- Forked from Virtual Folder plugin by @deathau to create Hierarchical TOC.
