"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOState = void 0;
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
