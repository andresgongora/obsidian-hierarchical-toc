import { describe, expect, it } from '@jest/globals';
import { OneNote } from '../src/onenote';

describe('OneNote', () =>
{
    it('constructor sets id/mtime/name/title and utime = ctime', () =>
    {
        const note = new OneNote('id.md', 100, 50, 'name', 'Title');
        expect(note.id).toBe('id.md');
        expect(note.mtime).toBe(100);
        expect(note.utime).toBe(50);
        expect(note.name).toBe('name');
        expect(note.title).toBe('Title');
        expect(note.parents).toEqual([]);
        expect(note.children).toEqual([]);
        expect(note.is_pinned).toBe(false);
    });

    it('is_no_parents / is_no_children reflect empty arrays', () =>
    {
        const note = new OneNote('id.md', 0, 0, 'n', 't');
        expect(note.is_no_parents()).toBe(true);
        expect(note.is_no_children()).toBe(true);
        expect(note.has_children()).toBe(false);
        expect(note.count_children()).toBe(0);
    });

    it('has_children / count_children reflect populated children', () =>
    {
        const note = new OneNote('id.md', 0, 0, 'n', 't');
        note.children = ['a.md', 'b.md'];
        expect(note.is_no_children()).toBe(false);
        expect(note.has_children()).toBe(true);
        expect(note.count_children()).toBe(2);
    });

    it('is_no_parents is false once parents populated', () =>
    {
        const note = new OneNote('id.md', 0, 0, 'n', 't');
        note.parents = ['p.md'];
        expect(note.is_no_parents()).toBe(false);
    });

    it('clear resets all mutable state', () =>
    {
        const note = new OneNote('id.md', 100, 50, 'n', 't');
        note.parents = ['p.md'];
        note.children = ['c.md'];
        note.is_pinned = true;
        note.link = 'somelink';

        note.clear();

        expect(note.parents).toEqual([]);
        expect(note.children).toEqual([]);
        expect(note.is_pinned).toBe(false);
        expect(note.link).toBe('');
        expect(note.mtime).toBe(0);
        expect(note.utime).toBe(0);
        // id/name/title are not reset by clear()
        expect(note.id).toBe('id.md');
        expect(note.name).toBe('n');
        expect(note.title).toBe('t');
    });
});
