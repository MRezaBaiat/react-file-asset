"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const abstract_file_system_1 = tslib_1.__importDefault(require("./abstract.file.system"));
const localforage_1 = tslib_1.__importDefault(require("localforage"));
class BrowserFileSystem extends abstract_file_system_1.default {
    constructor(cacheName) {
        super(cacheName);
        this.itemsCache = new Map();
        this.storage = localforage_1.default.createInstance({
            name: cacheName,
            storeName: cacheName,
            driver: localforage_1.default.INDEXEDDB,
            version: 1.0
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
    read(_id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let item = this.itemsCache.get(_id);
            if (!item) {
                item = (yield this.storage.getItem(_id));
                if (item) {
                    item.objectUrl = URL.createObjectURL(item.blob);
                    this.itemsCache.set(_id, item);
                }
            }
            if (item) {
                return Object.assign(Object.assign({ exists: true }, item), { localAddress: item.objectUrl });
            }
            return {
                exists: false
            };
        });
    }
}
exports.default = BrowserFileSystem;
