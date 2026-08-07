import { BaseScanner } from './base_scanner';

export class NoteData
{
    constructor(private base: BaseScanner)
    {
        // refector later
    }

    onStartApp()
    {
        this.base.rescan();
    }

    onCreate()
    {
        this.base.rescan();
    }

    onChange()
    {
        this.base.rescan();
    }

    onRename()
    {
        this.base.rescan();
    }

    onDelete()
    {
        this.base.rescan();
    }
}