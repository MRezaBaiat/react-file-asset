"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const file_asset_1 = tslib_1.__importDefault(require("./file.asset"));
const event_emitter_1 = tslib_1.__importDefault(require("./event.emitter"));
class AbstractFileSystem extends event_emitter_1.default {
    constructor(name) {
        super();
        this.name = name;
    }
    create(entry) {
        return file_asset_1.default.create(entry, this);
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
            return this.read(fileAsset.getMedia()._id);
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
    exists(_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return (yield this.read(_id)).exists;
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
exports.default = AbstractFileSystem;
;
