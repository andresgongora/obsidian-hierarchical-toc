import { App, TFile, Notice } from 'obsidian';
import { OneNote } from './onenote';
import HierarchicalTocPlugin from './main';
import { SortTypes } from './settings';

function _is_string(value: unknown)
{
    return typeof value === 'string';
}

class ScanSettings
{
	filter: string[] = [];
	title = '';
    prop_regexp?:RegExp = undefined;

    set_filter(filter: string[])
    {
        this.filter = filter;
    }

    set_title(title: string)
    {
        this.title = title;
    }

    set_prop(prop: string)
    {
		const regexp_str = `^${prop}(\\.\\d+){0,1}$`;
		this.prop_regexp = new RegExp(regexp_str);
    }

    is_valid()
    {
        return typeof this.prop_regexp !== 'undefined';
    }
};

export class BaseScanner
{
    note_list:  {[id: string] : OneNote} = {};
    top_list: string[] = [];
    last_active: string[] = ["1"];
    settings: ScanSettings = new ScanSettings();

    constructor(private app: App, private plugin: HierarchicalTocPlugin)
    {

    }

    test_prop_name(prop_name:string)
    {
        if(!this.settings.prop_regexp) return false;
        return this.settings.prop_regexp.test(prop_name.trim());
    }

    restore_utime(old_list: {[id: string]: {utime: number}})
    {
		for (const id in old_list)
		{
            // how about renamed file ?

            if (id in this.note_list)
            {
                const new_ut = this.note_list[id].utime;
                const old_ut = old_list[id].utime;

                if (old_ut > new_ut)
                {
                    this.note_list[id].utime = old_ut;
                }
            }
		}
    }

    rescan()
    {
        if(!this.settings.is_valid()) return;

        const old_list = this.note_list;
        this.init_note_list();
        this.build_links();
        this.build_top();
        this.sort_links();
        this.restore_utime(old_list)
        this.warn_cyclic_notes();
    }

    get_filtred_count()
    {
        return this.app.vault.getMarkdownFiles().length - this.get_filted_list().length;
    }

    get_filted_list()
    {
        return this.app.vault.getMarkdownFiles().filter( (file) =>
        {
            for (const filter of this.settings.filter)
            {
                if (file.path.startsWith(filter)) return false;
            }

            return true;
        });
    }

    get_meta_value(file:TFile, prop:string)
    {
        const metadata = this.app.metadataCache.getFileCache(file);

        if(metadata && metadata.frontmatter)
        {
            if(prop in metadata.frontmatter)
            {
                const value = metadata.frontmatter[prop] as unknown;
                return _is_string(value) ? value : null;
            }
        }
    }

    // can we get it from Note class?

    get_note_title(file:TFile)
    {
        const name = file.basename;
        const title = this.get_meta_value(file, this.settings.title);
        return title ? title : name;
    }

    link_to_title(value:string)
    {
        const link_file = this.app.metadataCache.getFirstLinkpathDest(value, '');
        if(!link_file) return value;
        return this.get_note_title(link_file);
    }

    link_to_ctime(value:string)
    {
        const link_file = this.app.metadataCache.getFirstLinkpathDest(value, '');
        if(!link_file) return 0;
        return link_file.stat.ctime;
    }

    link_to_mtime(value:string)
    {
        const link_file = this.app.metadataCache.getFirstLinkpathDest(value, '');
        if(!link_file) return 0;
        return link_file.stat.mtime;
    }

    init_note_list()
    {
        this.note_list = {}

        // create empty notes
        for (const file of this.get_filted_list())
        {
            const file_id = file.path
            this.note_list[file_id] = new OneNote(
                file_id, file.stat.mtime, file.stat.ctime,
                file.basename, this.get_note_title(file)
            );
        }
    }

    build_links()
    {
        for (const file of this.get_filted_list())
        {
            const file_id = file.path

            const metadata = this.app.metadataCache.getFileCache(file);
            if (!metadata) continue;

            if(metadata.frontmatterLinks)
            {
                for(const link of metadata.frontmatterLinks)
				{
                    if (!this.test_prop_name(link.key)) continue;

                    const link_file = this.app.metadataCache.getFirstLinkpathDest(link.link, '');
                    if(!link_file) continue;

                    const link_id = link_file.path;
                    if(!(link_id in this.note_list)) continue;

                    // dedup: repeated identical [[link]] entries in the same
                    // YAML array would otherwise inflate count_children() and
                    // produce duplicate rendered rows / duplicate paths
                    if(this.note_list[file_id].parents.includes(link_id)) continue;

                    this.note_list[file_id].parents.push(link_id);
                    this.note_list[link_id].children.push(file_id);
                }
            }

            if(metadata.frontmatter)
            {
                if("IsPinned" in metadata.frontmatter)
                {
                    const value = metadata.frontmatter["IsPinned"] as unknown;
                    this.note_list[file_id].is_pinned = (value != "0" && value != "false");
                }
            }
        }
    }

    is_top(note:OneNote)
    {
        return note.is_no_parents() && note.has_children();
    }

    build_top()
    {
        this.top_list = [];

        for(const note of Object.values(this.note_list))
        {
            if(this.is_top(note))
            {
                this.top_list.push(note.id);
            }
        }
    }

    // notes whose entire parent chain forms a cycle (e.g. A -> B -> A) never
    // satisfy is_top() and are unreachable by walking down from top_list, so
    // they'd otherwise vanish from the tree with no indication why.
    find_cyclic_notes(): string[]
    {
        const cyclic: string[] = [];

        for (const start_id in this.note_list)
        {
            const visited = new Set<string>();
            const stack = [...this.note_list[start_id].parents];

            let in_cycle = false;
            while(stack.length > 0)
            {
                const cur = stack.pop() as string;
                if(cur === start_id) { in_cycle = true; break; }
                if(visited.has(cur)) continue;
                visited.add(cur);

                const note = this.note_list[cur];
                if(note) stack.push(...note.parents);
            }

            if(in_cycle) cyclic.push(start_id);
        }

        return cyclic;
    }

    warn_cyclic_notes()
    {
        const cyclic = this.find_cyclic_notes();
        if(cyclic.length === 0) return;

        new Notice(
            `Hierarchical TOC: ${cyclic.length} note(s) have a circular ` +
            `parent chain and won't appear in the tree: ${cyclic.slice(0, 5).join(', ')}` +
            (cyclic.length > 5 ? ', ...' : '')
        );
    }

    old_l_sort(links: string[])
	{
		const pinned = [];
		const normal = [];

		// cut array into pinned and normal items

		for(const id of links)
		{
            const note = this.note_by_id(id);
            if(!note) continue;

        	if(note.is_pinned)
			{
				pinned.push(id);
			}
			else
			{
				normal.push(id);
			}
		}

		pinned.sort();
		normal.sort();
		return pinned.concat(normal);
	}

    l_sort(links: string[])
	{
        const links_copy: string[] = [...links];
        const sortBy: SortTypes = this.plugin.settings.sortTreeBy;
        const sortRev: boolean = this.plugin.settings.sortTreeRev;

        if(sortBy == SortTypes.file_name)
        {
            links_copy.sort();
        }

        if(sortBy == SortTypes.note_title)
        {
            links_copy.sort(
                (a,b) =>
                {
                    a = this.link_to_title(a);
                    b = this.link_to_title(b);
                    if(a < b) { return -1; }
                    if(a > b) { return 1; }
                    return 0;
                }
            );
        }

        if(sortBy == SortTypes.creation_time)
        {
            links_copy.sort(
                (a,b) => {return this.link_to_ctime(a) - this.link_to_ctime(b);}
            );
        }

        if(sortBy == SortTypes.modification_time)
        {
            links_copy.sort(
                (a,b) => {return this.link_to_mtime(a) - this.link_to_mtime(b);}
            );
        }

        if(sortRev) links_copy.reverse();

        return links_copy;
    }

    sort_links()
    {
        for (const id in this.note_list)
        {
            const note = this.note_list[id];
            note.children = this.l_sort(note.children);
        }

        this.top_list = this.l_sort(this.top_list);
    }

    note_by_id(id: string): OneNote|undefined
    {
        if(id in this.note_list)
        {
            return this.note_list[id];
        }
    }

    is_same_mtime(file:TFile)
    {
        const id = file.path;
        const note = this.note_by_id(id);
        if(!note) return false;
        return note.mtime == file.stat.mtime;
    }

    _count_unique(arr:string[]): number
    {
        return new Set(arr).size;
    }

    _is_recursion(arr:string[])
    {
        return this._count_unique(arr) != arr.length;
    }

    _build_path(note:OneNote, path:string[], path_list:string[][])
    {
        // skip infinite loop
        if(this._is_recursion(path)) return;

        // down-to-top, search from last to root
        if(this.is_top(note))
        {
            const new_path = ['top_dir'].concat(path);
            path_list.push(new_path);
            return;
        }

        for(const parent of note.parents)
        {
            const sub_note = this.note_by_id(parent);
            if(!sub_note) continue;

            const new_path = [sub_note.id].concat(path);
            this._build_path(sub_note, new_path, path_list);
        }
    }

    build_path_list(id: string)
    {
        const note = this.note_by_id(id);
        if(!note) return undefined;

        const path_list: string[][] = [];
        this._build_path(note, [note.id], path_list);

        return path_list;
    }

    _get_min_path(path_list: string[][])
    {
        let min_path:string[] = [];
        let min_count = 999;

        for(const path of path_list)
        {
            const len = path.length;

            if(len < min_count)
            {
                min_count = len;
                min_path = path;
            }
        }

        return min_path.slice();
    }

    get_shortest_path(id: string)
    {
        const path_list = this.build_path_list(id);;
        if(!path_list) return undefined;
        const path = this._get_min_path(path_list);
        return path;
    }

    _array_index(path_list: string[][], old_path: string[])
    {
        const old_path_str = old_path.join('/');
        for(let i = 0; i < path_list.length; i++)
        {
            if(path_list[i].join('/') === old_path_str)
            {
                return i;
            }
        }
    }

    _next_index(path_len: number, old_index: number)
    {
        return (path_len > old_index + 1) ? old_index + 1 : 0;
    }

    _split_into_parents(path_list: string[][])
    {
        const parent_list: {[id: string]: string[][];} = {};

        for(const path of path_list)
        {
            // path always has at least 2 elements here (top/root marker +
            // the note itself), but guard short paths defensively so a
            // malformed path can't silently key into 'undefined'.
            const parent:string|undefined = path[path.length-2];
            if(parent === undefined) continue;
            if (!(parent in parent_list)) parent_list[parent] = [];
            parent_list[parent].push(path);
        }

        return parent_list;
    }

    _get_shoretest_list(path_list: string[][])
    {
        const parent_list = this._split_into_parents(path_list);
        const shortest_list = [];

        for (const parent in parent_list)
        {
            const path_parent = parent_list[parent];
            shortest_list.push(this._get_min_path(path_parent));
        }

        return shortest_list;
    }

    get_next_path(id: string)
    {
        let path_list = this.build_path_list(id);
        if(!path_list) return undefined;

        // remove similar, save shortest
        path_list = this._get_shoretest_list(path_list);

        const old_index = this._array_index(path_list, this.last_active);
        let path = undefined;

        if(old_index === undefined)
        {
            path = this._get_min_path(path_list);
        }
        else
        {
            const next_index = this._next_index(path_list.length, old_index);
            path = path_list[next_index];
        }

        this.last_active = path.slice();
        return path;
    }

    get_children_for_note(id: string): string[]
    {
        if (id in this.note_list)
        {
            return this.note_list[id].children;
        }
        return [];
    }
}