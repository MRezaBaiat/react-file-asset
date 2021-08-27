import AbstractFileSystem from './src/abstract.file.system';
import FileAsset, { FileAssetInfo } from './src/file.asset';
import { FileEntry, Uploadable, Downloadable } from './src/file.entry';
import useFileAsset from './src/useFileAsset';
export declare enum IOState {
    IDLE = "IDLE",
    DOWNLOADING = "DOWNLOADING",
    UPLOADING = "UPLOADING",
    WAITING_FOR_UPLOAD = "WAITING_FOR_UPLOAD",
    WAITING_FOR_DOWNLOAD = "WAITING_FOR_DOWNLOAD",
    IN_DOWNLOAD_QUEUE = "IN_DOWNLOAD_QUEUE",
    IN_UPLOAD_QUEUE = "IN_UPLOAD_QUEUE",
    UPLOAD_FAILED = "UPLOAD_FAILED",
    DOWNLOAD_FAILED = "DOWNLOAD_FAILED"
}
export { AbstractFileSystem, FileAsset, FileAssetInfo, FileEntry, useFileAsset, Uploadable, Downloadable };
