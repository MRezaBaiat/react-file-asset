import { FileEntry } from './file.entry';
import FileAsset from './file.asset';
import AbstractFileSystem from './abstract.file.system';
declare function useFileAsset(media: FileEntry, fileSystem: AbstractFileSystem<any, any>): {
    info: {
        exists: false;
    } | {
        exists: true;
        media: any;
        state: import("..").IOState;
        progress: number;
        localAddress: string;
    } | undefined;
    asset: FileAsset<FileEntry>;
};
export default useFileAsset;
