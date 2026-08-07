import { describe, expect, it, jest } from '@jest/globals';
import { YamlParser } from '../src/yaml_parser';

function buildApp(opts: { activeFile?: any; fileExists?: boolean } = {})
{
    const activeFile = 'activeFile' in opts ? opts.activeFile : { path: 'note.md' };
    const fileExists = opts.fileExists ?? true;

    return {
        workspace: {
            getActiveFile: () => activeFile,
        },
        vault: {
            getFileByPath: (path: string) => (fileExists ? { path } : null),
        },
        metadataCache: {
            fileToLinktext: (file: any) => file.path.replace(/\.md$/, ''),
        },
        fileManager: {
            processFrontMatter: async (_file: any, cb: (fm: any) => void) =>
            {
                const fm: Record<string, any> = {};
                cb(fm);
                return fm;
            },
        },
    } as any;
}

function buildPlugin(useWikiLinks = true)
{
    return { settings: { UseWikiLinks: useWikiLinks } } as any;
}

describe('YamlParser', () =>
{
    describe('add_link', () =>
    {
        it('adds a wikilink to an empty prop', async () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = {};
            parser._fm_add_link(fm, 'target.md', 'up');
            expect(fm['up']).toEqual(['[[target]]']);
        });

        it('adds a markdown-style link when UseWikiLinks is false', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(false));
            const fm: Record<string, any> = {};
            parser._fm_add_link(fm, 'target.md', 'up');
            expect(fm['up']).toEqual(['[target](target)']);
        });

        it('does not duplicate an existing link', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = { up: ['[[target]]'] };
            parser._fm_add_link(fm, 'target.md', 'up');
            expect(fm['up']).toEqual(['[[target]]']);
        });

        it('does nothing when the selected file does not exist', () =>
        {
            const app = buildApp({ fileExists: false });
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = {};
            parser._fm_add_link(fm, 'missing.md', 'up');
            expect(fm['up']).toBeUndefined();
        });

        it('add_link is a no-op when there is no active file', async () =>
        {
            const app = buildApp({ activeFile: null });
            const parser = new YamlParser(app, buildPlugin(true));
            await expect(parser.add_link('up', 'target.md')).resolves.toBeUndefined();
        });

        it('add_link writes through processFrontMatter when active file exists', async () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            await expect(parser.add_link('up', 'target.md')).resolves.not.toThrow();
        });
    });

    describe('replace_link', () =>
    {
        it('replaces an existing old_link entry with the new formatted link', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = { up: ['[[old]]'] };
            parser._fm_replace_link(fm, 'target.md', 'up', '[[old]]');
            expect(fm['up']).toEqual(['[[target]]']);
        });

        it('reports when old_link is not found in prop', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = { up: ['[[other]]'] };
            parser._fm_replace_link(fm, 'target.md', 'up', '[[old]]');
            // no replacement happened
            expect(fm['up']).toEqual(['[[other]]']);
        });

        it('reports when new link already exists', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = { up: ['[[target]]', '[[old]]'] };
            parser._fm_replace_link(fm, 'target.md', 'up', '[[old]]');
            expect(fm['up']).toEqual(['[[target]]', '[[old]]']);
        });

        it('leaves prop untouched and reports when prop is absent', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = {};
            parser._fm_replace_link(fm, 'target.md', 'up', '[[old]]');
            expect(fm['up']).toBeUndefined();
        });
    });

    describe('get_links', () =>
    {
        it('returns prop array when present', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm = { up: ['[[a]]', '[[b]]'] };
            expect(parser._fm_get_links(fm, 'up')).toEqual(['[[a]]', '[[b]]']);
        });

        it('returns empty array when prop absent', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            expect(parser._fm_get_links({}, 'up')).toEqual([]);
        });

        it('invokes callback with resolved links via processFrontMatter', async () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const results: string[][] = [];
            await parser.get_links('up', (result) => results.push(result));
            expect(results).toEqual([[]]);
        });

        it('is a no-op when no active file', async () =>
        {
            const app = buildApp({ activeFile: null });
            const parser = new YamlParser(app, buildPlugin(true));
            const cb = jest.fn();
            await parser.get_links('up', cb);
            expect(cb).not.toHaveBeenCalled();
        });
    });

    describe('remove_link', () =>
    {
        it('removes an existing link', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = { up: ['[[a]]', '[[b]]'] };
            parser._fm_remove_link(fm, 'up', '[[a]]');
            expect(fm['up']).toEqual(['[[b]]']);
        });

        it('reports when link not found', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = { up: ['[[b]]'] };
            parser._fm_remove_link(fm, 'up', '[[a]]');
            expect(fm['up']).toEqual(['[[b]]']);
        });

        it('is a no-op when prop absent', () =>
        {
            const app = buildApp();
            const parser = new YamlParser(app, buildPlugin(true));
            const fm: Record<string, any> = {};
            expect(() => parser._fm_remove_link(fm, 'up', '[[a]]')).not.toThrow();
        });
    });
});
