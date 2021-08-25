export declare type FileEntry = {
    _id: string;
    filename: string;
    length: number;
    url: string;
} | {
    _id: string;
    length: number;
    filename: string;
    localSource: string;
};
