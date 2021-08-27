import { AxiosInstance } from 'axios';
import FileAsset from './file.asset';
import EventEmitter from './event.emitter';
import { FileEntry } from './file.entry';
export default abstract class AbstractFileSystem<FileEntryType extends FileEntry, DataType> extends EventEmitter<string> {
    name: string;
    protected abstract save(media: FileEntryType, data: DataType): Promise<FileEntryType>;
    abstract read(_id: string): Promise<{
        exists: false;
    } | {
        exists: true;
        length: number;
        fileName: string;
        localAddress: string;
        lastModified: number;
    }>;
    create<T extends FileEntryType>(entry: T): FileAsset<T>;
    getFileInfo(fileAsset: FileAsset<FileEntryType>): Promise<{
        exists: false;
    } | {
        exists: true;
        length: number;
        fileName: string;
        localAddress: string;
        lastModified: number;
    }>;
    download(fileAsset: FileAsset<FileEntryType>, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<any>;
    exists(_id: string): Promise<boolean>;
    upload(fileAsset: FileAsset<FileEntryType>, url: string, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<FileEntryType>;
    constructor(name: string);
}
