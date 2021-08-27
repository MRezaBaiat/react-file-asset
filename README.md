handling download and uploading files to/from 
server can be something very tricky to handle in the applications.
this library is meant to simplify the IO with the server and caching into the disk super simple

##Installation

`yarn add react-file-asset`

#Usage
first you need to declare a file system which extends `AbstractFileSystem` and is responsible for handling downloading , uploading and caching files such as :

``` typescript
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
```
later you can use it like this:

`useFileAsset(fileEntry)`

by default upload and download functions use axios and feed/produce Blob , however you can always override any methods and replace with your desired functions
