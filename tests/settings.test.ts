import { describe, expect, it } from '@jest/globals';
import { DEFAULT_SETTINGS, SortTypes } from '../src/settings';

describe('settings defaults', () =>
{
    it('DEFAULT_SETTINGS has expected shape', () =>
    {
        expect(DEFAULT_SETTINGS).toEqual({
            ignorePath: '',
            propertyName: 'up',
            sortTreeBy: SortTypes.file_name,
            sortTreeRev: false,
            UseWikiLinks: true,
            showChildCount: true,
            autoExpandTree: false,
            autoExpandDepth: 0,
        });
    });

    it('SortTypes enum has the four expected members', () =>
    {
        expect(Object.values(SortTypes)).toEqual([
            'file_name',
            'note_title',
            'creation_time',
            'modification_time',
        ]);
    });
});
