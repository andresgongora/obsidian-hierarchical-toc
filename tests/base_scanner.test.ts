import { describe, expect, it, beforeEach } from '@jest/globals';
import { BaseScanner } from '../src/base_scanner';
import { SortTypes } from '../src/settings';

// Minimal fake TFile / App / Plugin doubles. Only the surface BaseScanner
// actually touches is implemented.

function makeFile(path: string, mtime = 0, ctime = 0)
{
    const parts = path.split('/');
    const basename = parts[parts.length - 1].replace(/\.md$/, '');
    return { path, basename, stat: { mtime, ctime } };
}

interface FakeNoteSpec
{
    path: string;
    title?: string;
    parents?: string[]; // link targets by path, using yamlProp
    isPinned?: string;
    mtime?: number;
    ctime?: number;
}

function buildApp(notes: FakeNoteSpec[], propName = 'up')
{
    const files = notes.map(n => makeFile(n.path, n.mtime ?? 0, n.ctime ?? 0));
    const filesByPath: Record<string, any> = {};
    for (const f of files) filesByPath[f.path] = f;

    const metaByPath: Record<string, any> = {};
    for (const n of notes)
    {
        const frontmatter: Record<string, any> = {};
        if (n.title) frontmatter['title'] = n.title;
        if (n.isPinned !== undefined) frontmatter['IsPinned'] = n.isPinned;

        const frontmatterLinks = (n.parents ?? []).map((p, i) => ({
            key: n.parents!.length > 1 ? `${propName}.${i}` : propName,
            link: p,
        }));

        metaByPath[n.path] = { frontmatter, frontmatterLinks };
    }

    const app = {
        vault: {
            getMarkdownFiles: () => files,
        },
        metadataCache: {
            getFileCache: (file: any) => metaByPath[file.path],
            getFirstLinkpathDest: (link: string) => filesByPath[link] ?? null,
        },
    };

    return app as any;
}

function buildPlugin(sortBy: SortTypes = SortTypes.file_name, sortRev = false)
{
    return { settings: { sortTreeBy: sortBy, sortTreeRev: sortRev } } as any;
}

describe('BaseScanner', () =>
{
    describe('rescan / graph building', () =>
    {
        it('builds parent/child links from frontmatter link prop', () =>
        {
            const app = buildApp([
                { path: 'parent.md' },
                { path: 'child.md', parents: ['parent.md'] },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            expect(scanner.note_by_id('parent.md')?.children).toEqual(['child.md']);
            expect(scanner.note_by_id('child.md')?.parents).toEqual(['parent.md']);
        });

        it('does nothing until settings.is_valid() (prop set)', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.rescan();
            expect(scanner.note_list).toEqual({});
        });

        it('ignores links to files outside the filtered list', () =>
        {
            const app = buildApp([
                { path: 'child.md', parents: ['missing.md'] },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.note_by_id('child.md')?.parents).toEqual([]);
        });

        it('marks IsPinned true/false correctly, "0" and "false" treated as unpinned', () =>
        {
            const app = buildApp([
                { path: 'a.md', isPinned: '1' },
                { path: 'b.md', isPinned: '0' },
                { path: 'c.md', isPinned: 'false' },
                { path: 'd.md', isPinned: 'true' },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            expect(scanner.note_by_id('a.md')?.is_pinned).toBe(true);
            expect(scanner.note_by_id('b.md')?.is_pinned).toBe(false);
            expect(scanner.note_by_id('c.md')?.is_pinned).toBe(false);
            expect(scanner.note_by_id('d.md')?.is_pinned).toBe(true);
        });

        it('applies filter list to skip paths', () =>
        {
            const app = buildApp([
                { path: 'skip/a.md' },
                { path: 'keep/b.md' },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.settings.set_filter(['skip/']);
            scanner.rescan();

            expect(Object.keys(scanner.note_list)).toEqual(['keep/b.md']);
            expect(scanner.get_filtred_count()).toBe(1);
        });

        it('top_list contains only notes with no parents and at least one child', () =>
        {
            const app = buildApp([
                { path: 'top.md' },
                { path: 'child.md', parents: ['top.md'] },
                { path: 'lonely.md' },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            expect(scanner.top_list).toEqual(['top.md']);
        });
    });

    describe('get_note_title / link_to_title', () =>
    {
        it('falls back to basename when no title prop configured', () =>
        {
            const app = buildApp([{ path: 'note.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.note_by_id('note.md')?.title).toBe('note');
        });

        it('uses configured title prop when present', () =>
        {
            const app = buildApp([{ path: 'note.md', title: 'Custom Title' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_title('title');
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.note_by_id('note.md')?.title).toBe('Custom Title');
        });

        it('link_to_title returns raw value if link target not found', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.link_to_title('missing.md')).toBe('missing.md');
        });
    });

    describe('sorting', () =>
    {
        function threeChildren(sortBy: SortTypes, sortRev = false)
        {
            const app = buildApp([
                { path: 'top.md' },
                { path: 'b.md', parents: ['top.md'], mtime: 2, ctime: 20 },
                { path: 'a.md', parents: ['top.md'], mtime: 3, ctime: 10 },
                { path: 'c.md', parents: ['top.md'], mtime: 1, ctime: 30 },
            ]);
            const scanner = new BaseScanner(app, buildPlugin(sortBy, sortRev));
            scanner.settings.set_prop('up');
            scanner.rescan();
            return scanner;
        }

        it('sorts by file_name', () =>
        {
            const scanner = threeChildren(SortTypes.file_name);
            expect(scanner.note_by_id('top.md')?.children).toEqual(['a.md', 'b.md', 'c.md']);
        });

        it('sorts by file_name reversed', () =>
        {
            const scanner = threeChildren(SortTypes.file_name, true);
            expect(scanner.note_by_id('top.md')?.children).toEqual(['c.md', 'b.md', 'a.md']);
        });

        it('sorts by creation_time', () =>
        {
            const scanner = threeChildren(SortTypes.creation_time);
            expect(scanner.note_by_id('top.md')?.children).toEqual(['a.md', 'b.md', 'c.md']);
        });

        it('sorts by modification_time', () =>
        {
            const scanner = threeChildren(SortTypes.modification_time);
            expect(scanner.note_by_id('top.md')?.children).toEqual(['c.md', 'b.md', 'a.md']);
        });

        it('old_l_sort separates pinned first, each group alphabetized', () =>
        {
            const app = buildApp([
                { path: 'z.md', isPinned: '1' },
                { path: 'a.md' },
                { path: 'b.md', isPinned: '1' },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.old_l_sort(['z.md', 'a.md', 'b.md'])).toEqual(['b.md', 'z.md', 'a.md']);
        });

        it('old_l_sort skips ids missing from note_list instead of throwing', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.old_l_sort(['missing.md', 'a.md'])).toEqual(['a.md']);
        });
    });

    describe('restore_utime', () =>
    {
        it('keeps the newer utime between old and new scan results', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            scanner.restore_utime({ 'a.md': { utime: 999 } });
            expect(scanner.note_by_id('a.md')?.utime).toBe(999);
        });

        it('ignores ids no longer present in note_list', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(() => scanner.restore_utime({ 'gone.md': { utime: 1 } })).not.toThrow();
        });
    });

    describe('is_same_mtime / note_by_id', () =>
    {
        it('returns false for unknown note id', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.is_same_mtime(makeFile('unknown.md') as any)).toBe(false);
        });

        it('returns true when mtime matches', () =>
        {
            const app = buildApp([{ path: 'a.md', mtime: 42 }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.is_same_mtime(makeFile('a.md', 42) as any)).toBe(true);
        });
    });

    describe('path building: build_path_list / get_shortest_path / get_next_path', () =>
    {
        function chain()
        {
            const app = buildApp([
                { path: 'top.md' },
                { path: 'mid.md', parents: ['top.md'] },
                { path: 'leaf.md', parents: ['mid.md'] },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            return scanner;
        }

        it('build_path_list returns undefined for unknown id', () =>
        {
            const scanner = chain();
            expect(scanner.build_path_list('missing.md')).toBeUndefined();
        });

        it('build_path_list returns path from top_dir to node', () =>
        {
            const scanner = chain();
            const paths = scanner.build_path_list('leaf.md');
            expect(paths).toEqual([['top_dir', 'top.md', 'mid.md', 'leaf.md']]);
        });

        it('get_shortest_path picks minimum-length path among multiple parents', () =>
        {
            const app = buildApp([
                { path: 'top.md' },
                { path: 'shortcut.md', parents: ['top.md'] },
                { path: 'mid1.md', parents: ['top.md'] },
                { path: 'mid2.md', parents: ['mid1.md'] },
                // leaf has two parents: one direct (shortcut), one via a longer chain
                { path: 'leaf.md', parents: ['shortcut.md', 'mid2.md'] },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            const shortest = scanner.get_shortest_path('leaf.md');
            expect(shortest).toEqual(['top_dir', 'top.md', 'shortcut.md', 'leaf.md']);
        });

        it('get_shortest_path returns undefined for unknown id', () =>
        {
            const scanner = chain();
            expect(scanner.get_shortest_path('missing.md')).toBeUndefined();
        });

        it('_is_recursion / _build_path skip cyclic paths without infinite loop', () =>
        {
            // Manually craft a cycle: a parent of b, b parent of a (never
            // achievable through build_links() from real frontmatter, but
            // exercised directly to prove the recursion guard holds).
            const app = buildApp([{ path: 'a.md' }, { path: 'b.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            const a = scanner.note_by_id('a.md')!;
            const b = scanner.note_by_id('b.md')!;
            a.parents = ['b.md'];
            b.parents = ['a.md'];

            const paths = scanner.build_path_list('a.md');
            expect(paths).toEqual([]);
        });

        it('get_next_path cycles through path options on repeated calls', () =>
        {
            const app = buildApp([
                { path: 'top.md' },
                { path: 'p1.md', parents: ['top.md'] },
                { path: 'p2.md', parents: ['top.md'] },
                { path: 'leaf.md', parents: ['p1.md', 'p2.md'] },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();

            const first = scanner.get_next_path('leaf.md');
            const second = scanner.get_next_path('leaf.md');
            expect(first).not.toEqual(second);
            expect(scanner.last_active).toEqual(second);
        });

        it('get_next_path returns undefined for unknown id', () =>
        {
            const scanner = chain();
            expect(scanner.get_next_path('missing.md')).toBeUndefined();
        });
    });

    describe('get_children_for_note', () =>
    {
        it('returns children array for known id', () =>
        {
            const app = buildApp([
                { path: 'top.md' },
                { path: 'child.md', parents: ['top.md'] },
            ]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.get_children_for_note('top.md')).toEqual(['child.md']);
        });

        it('returns empty array for unknown id', () =>
        {
            const app = buildApp([{ path: 'a.md' }]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            scanner.rescan();
            expect(scanner.get_children_for_note('missing.md')).toEqual([]);
        });
    });

    describe('test_prop_name', () =>
    {
        it('returns false when prop never configured', () =>
        {
            const app = buildApp([]);
            const scanner = new BaseScanner(app, buildPlugin());
            expect(scanner.test_prop_name('up')).toBe(false);
        });

        it('matches base prop and indexed variants like prop.0', () =>
        {
            const app = buildApp([]);
            const scanner = new BaseScanner(app, buildPlugin());
            scanner.settings.set_prop('up');
            expect(scanner.test_prop_name('up')).toBe(true);
            expect(scanner.test_prop_name('up.0')).toBe(true);
            expect(scanner.test_prop_name('down')).toBe(false);
        });
    });
});
