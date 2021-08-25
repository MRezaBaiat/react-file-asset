"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const abstract_file_system_1 = tslib_1.__importDefault(require("./abstract.file.system"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const file_asset_1 = tslib_1.__importDefault(require("./file.asset"));
const localforage_1 = tslib_1.__importDefault(require("localforage"));
class BrowserFileSystem extends abstract_file_system_1.default {
    constructor(cacheName) {
        super(cacheName);
        this.itemsCache = new Map();
        this.getOrRead = (id) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let item = this.itemsCache.get(id);
            if (item) {
                return item;
            }
            item = (yield this.storage.getItem(id));
            if (item) {
                item.objectUrl = URL.createObjectURL(item.blob);
                this.itemsCache.set(id, item);
                return item;
            }
            return undefined;
        });
        this.storage = localforage_1.default.createInstance({
            name: cacheName,
            storeName: cacheName,
            driver: localforage_1.default.INDEXEDDB,
            version: 1.0
        });
    }
    create(media) {
        return file_asset_1.default.create(media, this);
    }
    initialize() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Promise.resolve(undefined);
        });
    }
    save(media, blob) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const item = {
                blob: blob,
                fileName: media.filename,
                length: media.length,
                lastModified: Date.now(),
                objectUrl: URL.createObjectURL(blob)
            };
            this.itemsCache.set(media._id, item);
            yield this.storage.setItem(media._id, item);
            this.emit(media._id);
            return media;
        });
    }
    exists(mediaId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return Boolean(yield this.getOrRead(mediaId));
        });
    }
    getFileInfo(fileAsset) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (fileAsset.isUploadable()) {
                return {
                    exists: true,
                    fileName: fileAsset.getMedia().filename,
                    length: fileAsset.getMedia().length,
                    lastModified: 0,
                    localAddress: fileAsset.getMedia().localSource
                };
            }
            const val = yield this.getOrRead(fileAsset.getMedia()._id);
            if (val) {
                return Object.assign(Object.assign({ exists: true }, val), { localAddress: val.objectUrl });
            }
            return {
                exists: false
            };
        });
    }
    download(fileAsset, headers, onProgress, axiosInstance) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (axiosInstance || axios_1.default).get(fileAsset.getMedia().url, {
                responseType: 'blob',
                method: 'GET',
                headers: Object.assign({}, headers),
                onDownloadProgress: (progressEvent) => {
                    onProgress && onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            }).then(res => this.save(fileAsset.getMedia(), res.data));
        });
    }
    upload(fileAsset, url, headers, onProgress, axiosInstance) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const formData = new FormData();
            const source = fileAsset.getMedia().localSource;
            const blob = yield fetch(source).then(r => r.blob());
            const mime = blob.type;
            const extension = mime.split('/')[1];
            const file = new File([blob], fileAsset.getMedia().filename + '.' + extension, {
                type: mime
            });
            formData.append('file', file);
            return (axiosInstance || axios_1.default).post(url, formData, {
                headers: Object.assign({}, headers),
                onUploadProgress: (progressEvent) => {
                    onProgress && onProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
                }
            })
                .then(res => res.data)
                .then(res => this.save(res, blob));
        });
    }
}
exports.default = BrowserFileSystem;
