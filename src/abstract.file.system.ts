import axios, { AxiosInstance } from 'axios';
import FileAsset from './file.asset';
import EventEmitter from './event.emitter';
import { FileEntry, Uploadable } from './file.entry';

export default abstract class AbstractFileSystem<FileEntryType extends FileEntry, DataType> extends EventEmitter<string> {
  public name: string;
  protected abstract save(media: FileEntryType, data: DataType): Promise<FileEntryType>
  public abstract read(_id: string): Promise<{ exists: false } | { exists: true, length: number, fileName: string, localAddress: string, lastModified: number }>

  public create<T extends FileEntryType> (entry: T): FileAsset<T> {
    return FileAsset.create(entry, this);
  }

  public async getFileInfo (fileAsset: FileAsset<FileEntryType>): Promise<{ exists: false } | { exists: true, length: number, fileName: string, localAddress: string, lastModified: number }> {
    if (fileAsset.isUploadable()) {
      return {
        exists: true,
        fileName: fileAsset.getMedia().filename,
        length: fileAsset.getMedia().length,
        lastModified: 0,
        localAddress: (fileAsset.getMedia() as Uploadable).localSource
      };
    }
    return this.read(fileAsset.getMedia()._id);
  }

  public async download (fileAsset: FileAsset<FileEntryType>, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<any> {
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

  public async exists (_id: string): Promise<boolean> {
    return (await this.read(_id)).exists;
  }

  public async upload (fileAsset: FileAsset<FileEntryType>, url: string, headers: Record<string, string>, onProgress: (progress: number) => void, axiosInstance?: AxiosInstance): Promise<FileEntryType> {
    const formData = new FormData();
    const source = (fileAsset.getMedia() as Uploadable).localSource;
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
      .then(res => this.save(res, blob as any));
  }

  constructor (name: string) {
    super();
    this.name = name;
  }
};
