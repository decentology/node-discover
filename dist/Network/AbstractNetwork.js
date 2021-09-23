"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNetwork = void 0;
const os_1 = __importDefault(require("os"));
const dgram_1 = __importDefault(require("dgram"));
const internal_1 = require("../internal");
const events_1 = require("events");
const Security_1 = require("../Security");
const NetworkEvents_1 = require("./NetworkEvents");
class AbstractNetwork extends events_1.EventEmitter {
    constructor(options = {}) {
        var _a;
        super();
        this.socket = null;
        this.options = {
            address: "0.0.0.0",
            port: 12345,
            key: null,
            exclusive: false,
            reuseAddr: true,
            hostname: (_a = process.env.DISCOVERY_HOSTNAME) !== null && _a !== void 0 ? _a : os_1.default.hostname(),
            ...options,
        };
    }
    send(event, data) {
        const message = {
            event: event,
            hostname: this.options.hostname,
            pid: internal_1.PROCESS_UUID,
            ...data,
        };
        if (!this.socket) {
            throw new Error("RuntimeException: Network not started, start network first to send data.");
        }
        const socket = this.getSocket();
        this.encode(message, (error, contents) => {
            if (error) {
                this.emit("error", error);
                return;
            }
            if (contents) {
                const encodedMessage = Buffer.from(contents);
                const destinations = this.getDestinations();
                for (const destination of destinations) {
                    socket.send(encodedMessage, 0, encodedMessage.length, destination.port || this.options.port, destination.address);
                }
            }
        });
    }
    start(callback) {
        const socket = this.getSocket();
        socket.on("message", (data, rinfo) => {
            this.decode(data, (error, message) => {
                if (error) {
                    //most decode errors are because we tried
                    //to decrypt a packet for which we do not
                    //have the key
                    //the only other possibility is that the
                    //message was split across packet boundaries
                    //and that is not handled
                    //self.emit("error", err);
                    // @todo
                }
                if (message) {
                    this.emit(NetworkEvents_1.NetworkEvents.MESSAGE, message, rinfo);
                }
            });
        });
        this.on("error", function (error) {
            //TODO: Deal with this
            /*console.log("Network error: ", err.stack);*/
        });
        const bindOptions = {
            port: this.options.port,
            address: this.options.address,
            exclusive: this.options.exclusive
        };
        socket.bind(bindOptions, () => {
            callback && callback(null);
        });
    }
    stop(callback) {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
        return callback && callback();
    }
    getSocket() {
        if (!this.socket) {
            this.socket = dgram_1.default.createSocket({ type: "udp4", reuseAddr: this.options.reuseAddr });
        }
        return this.socket;
    }
    decode(data, callback) {
        const stringified = data.toString();
        try {
            if (this.options.key) {
                const decrypted = Security_1.Security.decrypt(stringified, this.options.key);
                const parsed = JSON.parse(decrypted);
                return callback(null, parsed);
            }
            const parsed = JSON.parse(stringified);
            return callback(null, parsed);
        }
        catch (error) {
            return callback(error, null);
        }
    }
    encode(data, callback) {
        const stringified = JSON.stringify(data);
        if (this.options.key) {
            try {
                const encrypted = Security_1.Security.encrypt(stringified, this.options.key);
                return callback(null, encrypted);
            }
            catch (error) {
                return callback(error, null);
            }
        }
        return callback(null, stringified);
    }
}
exports.AbstractNetwork = AbstractNetwork;
//# sourceMappingURL=AbstractNetwork.js.map