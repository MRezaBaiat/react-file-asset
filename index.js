"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFileAsset = exports.FileAsset = exports.AbstractFileSystem = exports.IOState = void 0;
const tslib_1 = require("tslib");
const abstract_file_system_1 = tslib_1.__importDefault(require("./src/abstract.file.system"));
exports.AbstractFileSystem = abstract_file_system_1.default;
const file_asset_1 = tslib_1.__importDefault(require("./src/file.asset"));
exports.FileAsset = file_asset_1.default;
const useFileAsset_1 = tslib_1.__importDefault(require("./src/useFileAsset"));
exports.useFileAsset = useFileAsset_1.default;
var IOState;
(function (IOState) {
    IOState["IDLE"] = "IDLE";
    IOState["DOWNLOADING"] = "DOWNLOADING";
    IOState["UPLOADING"] = "UPLOADING";
    IOState["WAITING_FOR_UPLOAD"] = "WAITING_FOR_UPLOAD";
    IOState["WAITING_FOR_DOWNLOAD"] = "WAITING_FOR_DOWNLOAD";
    IOState["IN_DOWNLOAD_QUEUE"] = "IN_DOWNLOAD_QUEUE";
    IOState["IN_UPLOAD_QUEUE"] = "IN_UPLOAD_QUEUE";
    IOState["UPLOAD_FAILED"] = "UPLOAD_FAILED";
    IOState["DOWNLOAD_FAILED"] = "DOWNLOAD_FAILED";
})(IOState = exports.IOState || (exports.IOState = {}));
