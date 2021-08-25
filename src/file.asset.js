"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const awaitqueue_1 = require("awaitqueue");
const index_1 = require("../index");
const event_emitter_1 = tslib_1.__importDefault(require("./event.emitter"));
const TAG = '[file-asset]';
const ioQueue = new awaitqueue_1.AwaitQueue();
const cache = new Map();
class FileAsset extends event_emitter_1.default {
    constructor(media, fileSystem) {
        super();
        this.notifyQueue = new awaitqueue_1.AwaitQueue();
        this.state = index_1.IOState.IDLE;
        this.progress = 0;
        this.notifyListeners = (event, ...params) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const info = yield this.getInfo();
            this.emit(event, info, ...params);
        });
        this.changeState = (state, progress = 0) => {
            this.state = state;
            this.progress = progress;
            this.notifyQueue.push(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.notifyListeners('change');
            }));
        };
        this.getMedia = () => this.media;
        this.isUploading = () => this.state === index_1.IOState.UPLOADING || this.state === index_1.IOState.IN_UPLOAD_QUEUE;
        this.isDownloading = () => this.state === index_1.IOState.DOWNLOADING || this.state === index_1.IOState.IN_DOWNLOAD_QUEUE;
        this.isDownloadFailed = () => this.state === index_1.IOState.DOWNLOAD_FAILED;
        this.isUploadFailed = () => this.state === index_1.IOState.UPLOAD_FAILED;
        this.isUploadable = () => Boolean(this.media.localSource);
        this.isDownloadable = () => Boolean(this.media.url);
        this.getState = () => this.state;
        this.getProgress = () => this.progress;
        this.exists = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (this.isDownloadable()) {
                return this.fileSystem.exists(this.media._id);
            }
            else {
                return true;
            }
        });
        this.getIOState = () => {
            return {
                state: this.state,
                progress: this.progress
            };
        };
        this.getInfo = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const info = yield this.fileSystem.getFileInfo(this);
            if (!info.exists) {
                return {
                    exists: false
                };
            }
            return {
                state: this.state,
                progress: this.progress,
                media: this.media,
                exists: true,
                localAddress: info.localAddress
            };
        });
        this.fileSystem = fileSystem;
        this.media = media;
        cache.set(media._id, this);
        fileSystem.on(media._id, () => {
            this.notifyListeners('change');
        });
    }
    static create(media, fileSystem) {
        let existing = cache.get(media._id);
        if (!existing) {
            existing = new FileAsset(media, fileSystem);
        }
        return existing;
    }
    download(headers, axiosInstance) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isDownloadable()) {
                console.log(TAG, 'not downloadable');
                return;
            }
            const exists = yield this.exists();
            if (exists) {
                console.log(TAG, 'already exists');
                return;
            }
            if (this.isDownloading() || this.isUploading()) {
                console.log(TAG, 'is downloading or uploading');
                return;
            }
            this.changeState(index_1.IOState.IN_DOWNLOAD_QUEUE);
            return ioQueue.push(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                if (yield this.exists()) {
                    console.log(TAG, 'already exists');
                    return this.changeState(index_1.IOState.IDLE);
                }
                this.changeState(index_1.IOState.DOWNLOADING);
                const onProgress = (progress) => this.changeState(index_1.IOState.DOWNLOADING, progress);
                const onErr = (err) => {
                    console.log(TAG, err);
                    this.changeState(index_1.IOState.DOWNLOAD_FAILED);
                    this.notifyListeners('error', err);
                    throw err;
                };
                return this.fileSystem.download(this, headers, onProgress, axiosInstance)
                    .then(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.changeState(index_1.IOState.IDLE);
                    this.notifyListeners('downloaded');
                })).catch(onErr);
            }));
        });
    }
    upload(url, headers, axiosInstance) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!this.isUploadable()) {
                throw new Error('this media is not uploadable');
            }
            if (this.isDownloading() || this.isUploading()) {
                throw new Error('an io task is already in progress ' + this.state);
            }
            this.changeState(index_1.IOState.IN_UPLOAD_QUEUE);
            return ioQueue.push(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.changeState(index_1.IOState.UPLOADING);
                const onProgress = (progress) => this.changeState(index_1.IOState.UPLOADING, progress);
                const onErr = (err) => {
                    console.log(TAG, err);
                    this.changeState(index_1.IOState.UPLOAD_FAILED);
                    this.notifyListeners('error', err);
                    throw err;
                };
                return yield this.fileSystem.upload(this, url, headers, onProgress, axiosInstance).then((entry) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    this.changeState(index_1.IOState.IDLE);
                    this.notifyListeners('uploaded', entry);
                    return entry;
                })).catch(onErr);
            }));
        });
    }
}
exports.default = FileAsset;
