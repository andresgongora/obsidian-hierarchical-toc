// Obsidian's runtime extends Array.prototype with `.contains()` and
// `.remove()`. Source code under test (yaml_parser.ts) relies on these, so
// polyfill them for the test environment.

declare global
{
    interface Array<T>
    {
        contains(item: T): boolean;
        remove(item: T): void;
    }
}

if (!Array.prototype.contains)
{
    // eslint-disable-next-line no-extend-native
    Array.prototype.contains = function (item: unknown)
    {
        return this.indexOf(item) !== -1;
    };
}

if (!Array.prototype.remove)
{
    // eslint-disable-next-line no-extend-native
    Array.prototype.remove = function (item: unknown)
    {
        const i = this.indexOf(item);
        if (i !== -1) this.splice(i, 1);
    };
}

export {};
