import AbstractFileSystem from './abstract.file.system';
import { FileEntry } from './file.entry';
export default class BrowserFileSystem<T extends FileEntry> extends AbstractFileSystem<T, Blob> {
    private readonly storage;
    private itemsCache;
    constructor(cacheName: string);
    protected save(media: T, blob: Blob): Promise<T>;
    read(_id: string): Promise<{
        exists: false;
    } | {
        exists: true;
        length: number;
        fileName: string;
        localAddress: string;
        lastModified: number;
    }>;
}
