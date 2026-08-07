# Changelog

## 1.0.16 (2026.08.07)

- Hardened release flow: `release.sh` blocks if CHANGELOG.md missing entry for current version.

## 1.0.15 (2026.08.07)

- Hardened CI/CD release workflow with asset validation.

## 1.0.14 (2026.08.07)

- Fixed GitHub release title and changelog extraction logic.
- Addressed CI warnings.

## 1.0.13 (2026.08.07)

- Bumped `minAppVersion` to 1.7.2 for API compatibility.

## 1.0.12 (2026.08.07)

- Updated manifest.json metadata.

## 1.0.11 (2026.08.07)

- Clarified project origin in documentation (scaffolded from Virtual Folder, not forked).

## 1.0.10 (2026.08.07)

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

## 1.0.9 (2026.02.10)

- Undo suppressions.

## 1.0.8 (2026.02.10)

- Suppress sentence case linting warnings for literal text in UI components.

## 1.0.7 (2026.02.10)

- Lint.

## 1.0.6 (2026.02.10)

- Lint.

## 1.0.5 (2026.02.10)

- Fix counter style.
- Lint.

## 1.0.4 (2026.02.02)

- Update description in manifest.json.

## 1.0.3 (2026.01.22)

- Update License dates.
- Update dependencies.

## 1.0.2 (2026.01.15)

- Remove vestigial settings.

## 1.0.1 (2026.01.15)

- First release of Hierarchical TOC plugin.

## 1.0.0 (2026.01.15)

- Forked from Virtual Folder plugin by @deathau to create Hierarchical TOC.
