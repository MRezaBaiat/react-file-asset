import { AxiosInstance } from 'axios';
import FileAsset from './file.asset';
import EventEmitter from './event.emitter';
import { FileEntry } from './file.entry';
export default abstract class AbstractFileSystem<FileEntryType extends FileEntry, DataType> extends EventEmitter<string> {
    name: string;
    abstract exists(mediaId: string): Promise<boolean>;
    abstract getFileInfo(fileAsset: FileAsset<FileEntryType>): Promise<{
        exists: false;
    } | {
        exists: true;
        length: number;
        fileName: string;
        localAddress: string;
        lastModified: number;
    }>;
    abstract download(fileAsset: FileAsset<FileEntryType>, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<FileEntryType>;
    abstract upload(fileAsset: FileAsset<FileEntryType>, url: string, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<FileEntryType>;
    abstract initialize(): Promise<void>;
    protected abstract save(media: FileEntryType, data: DataType): Promise<FileEntryType>;
    abstract create(entry: FileEntryType): FileAsset<FileEntryType>;
    constructor(name: string);
}
