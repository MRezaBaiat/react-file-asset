import AbstractFileSystem from './abstract.file.system';
import { AxiosInstance } from 'axios';
import { FileEntry } from './file.entry';
import { IOState } from '../index';
import EventEmitter from './event.emitter';
export declare type FileAssetInfo<T> = {
    exists: false;
} | {
    exists: true;
    media: T;
    state: IOState;
    progress: number;
    localAddress: string;
};
declare type EventType = 'change' | 'uploaded' | 'downloaded' | 'error';
declare type StateTypes = IOState.DOWNLOADING | IOState.UPLOADING | IOState.IN_DOWNLOAD_QUEUE | IOState.IN_UPLOAD_QUEUE | IOState.IDLE | IOState.UPLOAD_FAILED | IOState.DOWNLOAD_FAILED;
export default class FileAsset<T extends FileEntry> extends EventEmitter<EventType> {
    private readonly media;
    private readonly notifyQueue;
    private readonly fileSystem;
    private state;
    private progress;
    private constructor();
    static create<T extends FileEntry>(media: T, fileSystem: AbstractFileSystem<T, any>): FileAsset<T>;
    private notifyListeners;
    private changeState;
    getMedia: () => T;
    isUploading: () => boolean;
    isDownloading: () => boolean;
    isDownloadFailed: () => boolean;
    isUploadFailed: () => boolean;
    isUploadable: () => boolean;
    isDownloadable: () => boolean;
    getState: () => StateTypes;
    getProgress: () => number;
    exists: () => Promise<boolean>;
    getIOState: () => {
        state: StateTypes;
        progress: number;
    };
    getInfo: () => Promise<FileAssetInfo<T>>;
    download(headers: Record<string, string>, axiosInstance?: AxiosInstance): Promise<void>;
    upload(url: string, headers: Record<string, string>, axiosInstance?: AxiosInstance): Promise<T>;
}
export {};
