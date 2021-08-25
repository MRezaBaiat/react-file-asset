import AbstractFileSystem from './abstract.file.system';
import axios, { AxiosInstance } from 'axios';
import FileAsset from './file.asset';
import localForage from 'localforage';
import { FileEntry } from './file.entry';

interface FileItem{
  length: number,
  fileName: string,
  blob: Blob,
  lastModified: number,
  objectUrl: string
}
export default class BrowserFileSystem<T extends FileEntry> extends AbstractFileSystem<T, Blob> {
  // eslint-disable-next-line no-undef
  private readonly storage: LocalForage;
  private itemsCache = new Map<string, FileItem>();

  public create (entry: T): FileAsset<T> {
    return FileAsset.create(entry, this);
  }

  constructor (cacheName: string) {
    super(cacheName);
    this.storage = localForage.createInstance({
      name: cacheName,
      storeName: cacheName,
      driver: localForage.INDEXEDDB,
      version: 1.0
    });
  }

  public async initialize (): Promise<void> {
    return Promise.resolve(undefined);
  }

  protected async save (media: T, blob: Blob) {
    const item: FileItem = {
      blob: blob,
      fileName: media.filename,
      length: media.length,
      lastModified: Date.now(),
      objectUrl: URL.createObjectURL(blob)
    };
    this.itemsCache.set(media._id, item);
    await this.storage.setItem(media._id, item);
    this.emit(media._id);
    return media;
  }

  private getOrRead = async (id: string): Promise<FileItem | undefined> => {
    let item = this.itemsCache.get(id);
    if (item) {
      return item;
    }
    item = await this.storage.getItem(id) as any;
    if (item) {
      item.objectUrl = URL.createObjectURL(item.blob);
      this.itemsCache.set(id, item);
      return item;
    }
    return undefined;
  }

  public async exists (mediaId: string): Promise<boolean> {
    return Boolean(await this.getOrRead(mediaId));
  }

  public async getFileInfo (fileAsset: FileAsset<T>): Promise<{ exists: false } | { exists: true, length: number, fileName: string, localAddress: string, lastModified: number }> {
    if (fileAsset.isUploadable()) {
      return {
        exists: true,
        fileName: fileAsset.getMedia().filename,
        length: fileAsset.getMedia().length,
        lastModified: 0,
        localAddress: (fileAsset.getMedia() as any).localSource
      };
    }
    const val = await this.getOrRead(fileAsset.getMedia()._id);
    if (val) {
      return {
        exists: true,
        ...val,
        localAddress: val.objectUrl
      };
    }
    return {
      exists: false
    };
  }

  public async download (fileAsset: FileAsset<T>, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<any> {
    return (axiosInstance || axios).get((fileAsset.getMedia() as any).url, {
      responseType: 'blob',
      method: 'GET',
      headers: {
        ...headers
      },
      onDownloadProgress: (progressEvent) => {
        onProgress && onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
      }
    }).then(res => this.save(fileAsset.getMedia(), res.data));
  }

  public async upload (fileAsset: FileAsset<T>, url: string, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<T> {
    const formData = new FormData();
    const source = (fileAsset.getMedia() as any).localSource;
    const blob = await fetch(source).then(r => r.blob());
    const mime = blob.type;
    const extension = mime.split('/')[1];
    const file = new File([blob], fileAsset.getMedia().filename + '.' + extension, {
      type: mime
    });
    formData.append('file', file);
    return (axiosInstance || axios).post(url,
      formData,
      {
        headers: {
          ...headers
        },
        onUploadProgress: (progressEvent) => {
          onProgress && onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        }
      })
      .then(res => res.data)
      .then(res => this.save(res, blob));
  }
}
