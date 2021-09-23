"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Security = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * @internal
 * @hidden
 */
class Security {
    static encrypt(data, key) {
        const buffer = [];
        const cipher = crypto_1.default.createCipher("aes256", key);
        buffer.push(cipher.update(data, "utf8", "binary"));
        buffer.push(cipher.final("binary"));
        return buffer.join("");
    }
    static decrypt(data, key) {
        const buffer = [];
        const decipher = crypto_1.default.createDecipher("aes256", key);
        buffer.push(decipher.update(data, "binary", "utf8"));
        buffer.push(decipher.final("utf8"));
        return buffer.join("");
    }
}
exports.Security = Security;
//# sourceMappingURL=Security.js.map