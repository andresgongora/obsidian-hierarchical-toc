import { describe, expect, it, jest } from '@jest/globals';
import { NoteData } from '../src/data';

describe('NoteData', () =>
{
    function buildBase()
    {
        return { rescan: jest.fn() } as any;
    }

    it('onStartApp triggers rescan', () =>
    {
        const base = buildBase();
        new NoteData(base).onStartApp();
        expect(base.rescan).toHaveBeenCalledTimes(1);
    });

    it('onCreate triggers rescan', () =>
    {
        const base = buildBase();
        new NoteData(base).onCreate();
        expect(base.rescan).toHaveBeenCalledTimes(1);
    });

    it('onChange triggers rescan', () =>
    {
        const base = buildBase();
        new NoteData(base).onChange();
        expect(base.rescan).toHaveBeenCalledTimes(1);
    });

    it('onRename triggers rescan', () =>
    {
        const base = buildBase();
        new NoteData(base).onRename();
        expect(base.rescan).toHaveBeenCalledTimes(1);
    });

    it('onDelete triggers rescan', () =>
    {
        const base = buildBase();
        new NoteData(base).onDelete();
        expect(base.rescan).toHaveBeenCalledTimes(1);
    });
});
