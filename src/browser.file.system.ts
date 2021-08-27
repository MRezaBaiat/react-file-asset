import AbstractFileSystem from './abstract.file.system';
import axios, { AxiosInstance } from 'axios';
import FileAsset from './file.asset';
import localForage from 'localforage';
import { FileEntry, Uploadable } from './file.entry';

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

  constructor (cacheName: string) {
    super(cacheName);
    this.storage = localForage.createInstance({
      name: cacheName,
      storeName: cacheName,
      driver: localForage.INDEXEDDB,
      version: 1.0
    });
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

  public async read (_id: string): Promise<{ exists: false } | { exists: true; length: number; fileName: string; localAddress: string; lastModified: number }> {
    let item = this.itemsCache.get(_id);
    if (!item) {
      item = await this.storage.getItem(_id) as any;
      if (item) {
        item.objectUrl = URL.createObjectURL(item.blob);
        this.itemsCache.set(_id, item);
      }
    }

    if (item) {
      return {
        exists: true,
        ...item,
        localAddress: item.objectUrl
      };
    }
    return {
      exists: false
    };
  }
}
