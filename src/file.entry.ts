export interface Downloadable{
    _id: string,
    filename: string,
    length: number,
    url: string
}

export interface Uploadable{
    _id: string,
    length: number,
    filename: string,
    localSource: string
}

export type FileEntry = Downloadable | Uploadable
