import AbstractFileSystem from './abstract.file.system';
import { AwaitQueue } from 'awaitqueue';
import { AxiosInstance } from 'axios';
import { FileEntry } from './file.entry';
import { IOState } from '../index';
import EventEmitter from './event.emitter';

const TAG = '[file-asset]';
const ioQueue = new AwaitQueue();
const cache = new Map<string, FileAsset<FileEntry>>();

export type FileAssetInfo<T> = {exists: false} | {exists: true, media: T, state: IOState, progress: number, localAddress: string}
type EventType = 'change' | 'uploaded' | 'downloaded' | 'error';
type StateTypes = IOState.DOWNLOADING | IOState.UPLOADING | IOState.IN_DOWNLOAD_QUEUE | IOState.IN_UPLOAD_QUEUE | IOState.IDLE | IOState.UPLOAD_FAILED | IOState.DOWNLOAD_FAILED;

export default class FileAsset<T extends FileEntry> extends EventEmitter<EventType> {
    private readonly media!: T;
    private readonly notifyQueue: AwaitQueue = new AwaitQueue();
    private readonly fileSystem: AbstractFileSystem<T, any>;
    private state: StateTypes = IOState.IDLE;
    private progress = 0;

    private constructor (media: T, fileSystem: AbstractFileSystem<T, any>) {
      super();
      this.fileSystem = fileSystem;
      this.media = media;

      cache.set(media._id, this);
      fileSystem.on(media._id, () => {
        this.notifyListeners('change');
      });
    }

    public static create<T extends FileEntry> (media: T, fileSystem: AbstractFileSystem<any, any>): FileAsset<T> {
      let existing = cache.get(media._id);
      if (!existing) {
        existing = new FileAsset(media, fileSystem);
      }
      return existing as any;
    }

    private notifyListeners = async (event: EventType, ...params) => {
      const info = await this.getInfo();
      this.emit(event, info, ...params);
    };

    private changeState = (state: StateTypes, progress = 0) => {
      this.state = state;
      this.progress = progress;
      this.notifyQueue.push(async () => {
        this.notifyListeners('change');
      });
    };

    public getMedia = () => this.media;
    public isUploading = () => this.state === IOState.UPLOADING || this.state === IOState.IN_UPLOAD_QUEUE;
    public isDownloading = () => this.state === IOState.DOWNLOADING || this.state === IOState.IN_DOWNLOAD_QUEUE;
    public isDownloadFailed = () => this.state === IOState.DOWNLOAD_FAILED;
    public isUploadFailed = () => this.state === IOState.UPLOAD_FAILED;
    public isUploadable = () => Boolean((this.media as any).localSource);
    public isDownloadable = () => Boolean((this.media as any).url);
    public getState = () => this.state;
    public getProgress = () => this.progress;

    public exists = async () => {
      if (this.isDownloadable()) {
        return this.fileSystem.exists(this.media._id);
      } else {
        return true;
      }
    }

    public getIOState = () => {
      return {
        state: this.state,
        progress: this.progress
      };
    }

    public getInfo = async (): Promise<FileAssetInfo<T>> => {
      const info = await this.fileSystem.getFileInfo(this);
      if (!info.exists) {
        return {
          exists: false
        };
      }
      return {
        state: this.state,
        progress: this.progress,
        media: this.media,
        exists: true,
        localAddress: info.localAddress
      };
    }

    public async download (headers: Record<string, string>, axiosInstance?: AxiosInstance) {
      if (!this.isDownloadable()) {
        console.log(TAG, 'not downloadable');
        return;
      }
      const exists = await this.exists();
      if (exists) {
        console.log(TAG, 'already exists');
        return;
      }
      if (this.isDownloading() || this.isUploading()) {
        console.log(TAG, 'is downloading or uploading');
        return;
      }

      this.changeState(IOState.IN_DOWNLOAD_QUEUE);

      return ioQueue.push(async () => {
        if (await this.exists()) {
          console.log(TAG, 'already exists');
          return this.changeState(IOState.IDLE);
        }

        this.changeState(IOState.DOWNLOADING);
        const onProgress = (progress: number) => this.changeState(IOState.DOWNLOADING, progress);
        const onErr = (err) => {
          console.log(TAG, err);
          this.changeState(IOState.DOWNLOAD_FAILED);
          this.notifyListeners('error', err);
          throw err;
        };

        return this.fileSystem.download(this as FileAsset<T>, headers, onProgress, axiosInstance)
          .then(async () => {
            this.changeState(IOState.IDLE);
            this.notifyListeners('downloaded');
          }).catch(onErr);
      });
    }

    public async upload (url: string, headers: Record<string, string>, axiosInstance?: AxiosInstance): Promise<T> {
      if (!this.isUploadable()) {
        throw new Error('this media is not uploadable');
      }
      if (this.isDownloading() || this.isUploading()) {
        throw new Error('an io task is already in progress ' + this.state);
      }
      this.changeState(IOState.IN_UPLOAD_QUEUE);
      return ioQueue.push(async () => {
        this.changeState(IOState.UPLOADING);

        const onProgress = (progress: number) => this.changeState(IOState.UPLOADING, progress);

        const onErr = (err) => {
          console.log(TAG, err);
          this.changeState(IOState.UPLOAD_FAILED);
          this.notifyListeners('error', err);
          throw err;
        };

        return await this.fileSystem.upload(this as FileAsset<T>, url, headers, onProgress, axiosInstance).then(async (entry: T) => {
          // cache.delete(this.media._id);
          // this.media = fileInfo as any;
          // cache.set(fileInfo._id, this);
          this.changeState(IOState.IDLE);
          this.notifyListeners('uploaded', entry);
          return entry;
        }).catch(onErr);
      });
    }
}
