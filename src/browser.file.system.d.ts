import AbstractFileSystem from './abstract.file.system';
import { AxiosInstance } from 'axios';
import FileAsset from './file.asset';
import { FileEntry } from './file.entry';
export default class BrowserFileSystem<T extends FileEntry> extends AbstractFileSystem<T, Blob> {
    private readonly storage;
    private itemsCache;
    create(entry: T): FileAsset<T>;
    constructor(cacheName: string);
    initialize(): Promise<void>;
    protected save(media: T, blob: Blob): Promise<T>;
    private getOrRead;
    exists(mediaId: string): Promise<boolean>;
    getFileInfo(fileAsset: FileAsset<T>): Promise<{
        exists: false;
    } | {
        exists: true;
        length: number;
        fileName: string;
        localAddress: string;
        lastModified: number;
    }>;
    download(fileAsset: FileAsset<T>, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<any>;
    upload(fileAsset: FileAsset<T>, url: string, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<T>;
}
