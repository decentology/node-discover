"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESERVED_EVENTS = exports.PROCESS_UUID = void 0;
const uuid_1 = require("uuid");
/**
 * @internal
 * @hidden
 */
exports.PROCESS_UUID = uuid_1.v4();
/**
 * @internal
 * @hidden
 */
exports.RESERVED_EVENTS = ["promotion", "demotion", "added", "removed", "master", "hello", "helloReceived", "helloEmitted"];
//# sourceMappingURL=internal.js.map