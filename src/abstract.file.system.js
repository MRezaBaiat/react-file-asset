"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const event_emitter_1 = tslib_1.__importDefault(require("./event.emitter"));
class AbstractFileSystem extends event_emitter_1.default {
    constructor(name) {
        super();
        this.name = name;
    }
}
exports.default = AbstractFileSystem;
;
