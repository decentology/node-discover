"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDestination = void 0;
/**
 * @internal
 * @hidden
 */
function createDestination(address, port) {
    if (!port) {
        if (~address.indexOf(":")) {
            const tokens = address.split(":");
            address = tokens[0];
            port = parseInt(tokens[1], 10);
        }
    }
    return {
        address,
        port,
    };
}
exports.createDestination = createDestination;
//# sourceMappingURL=CreateDestination.js.map