"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Discover = void 0;
const internal_1 = require("../internal");
const uuid_1 = require("uuid");
const Events_1 = require("./Events");
const events_1 = require("events");
const BroadcastNetwork_1 = require("../Network/BroadcastNetwork");
const __1 = require("..");
const NetworkEvents_1 = require("../Network/NetworkEvents");
class Discover extends events_1.EventEmitter {
    constructor(opts, readyCallback) {
        super();
        this.id = uuid_1.v4();
        this.nodes = {};
        this.channels = [];
        this.running = false;
        this.checkId = null;
        this.helloId = null;
        const options = typeof opts === "function" ? {} : (opts || {});
        const callback = typeof opts === "function" ? opts : (readyCallback || null);
        this.options = {
            helloInterval: 1000,
            checkInterval: 2000,
            nodeTimeout: 2000,
            mastersRequired: 1,
            leadershipElector: options.leadershipElector !== false ? new __1.BasicLeadershipElection() : false,
            ignoreProcess: true,
            ignoreInstance: true,
            start: true,
            advertisement: null,
            network: new BroadcastNetwork_1.BroadcastNetwork(),
            masterTimeout: options.nodeTimeout || 2000,
            weight: Discover.weight(),
            client: options.client || (!options.client && !options.server),
            server: options.server || (!options.client && !options.server),
            ...options,
        };
        if (this.options.leadershipElector) {
            this.options.leadershipElector.bind(this);
        }
        if (!(this.options.nodeTimeout >= this.options.checkInterval)) {
            throw new Error("nodeTimeout must be greater than or equal to checkInterval.");
        }
        if (!(this.options.masterTimeout >= this.options.nodeTimeout)) {
            throw new Error("masterTimeout must be greater than or equal to nodeTimeout.");
        }
        this.me = {
            isMaster: false,
            isMasterEligible: this.options.server,
            weight: this.options.weight,
            address: "127.0.0.1",
            advertisement: this.options.advertisement,
        };
        this.options.network.on("error", (error) => {
            this.emit("error", error);
        });
        //check if auto start is enabled
        if (this.options.start) {
            this.start(callback);
        }
    }
    getId() {
        return this.id;
    }
    getOptions() {
        return { ...this.options };
    }
    isRunning() {
        return this.running;
    }
    getChannels() {
        return this.channels;
    }
    getMe() {
        return { ...this.me };
    }
    getNodes() {
        return this.nodes;
    }
    /**
     * Start broadcasting hello packets and checking for missing nodes (start is called automatically in the constructor)
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * d.start();
     * ```
     * @param {AsyncCallback<boolean>} callback
     */
    start(callback) {
        if (this.running) {
            callback && callback(null, false);
            return;
        }
        this.options.network.start((error) => {
            if (error) {
                return callback && callback(error, null);
            }
            this.options.network.on(NetworkEvents_1.NetworkEvents.MESSAGE, (message, rinfo) => {
                if (message.pid == internal_1.PROCESS_UUID && this.options.ignoreProcess && message.iid !== this.id) {
                    return false;
                }
                else if (message.iid == this.id && this.options.ignoreInstance) {
                    return false;
                }
                else if (message.event && message.data) {
                    if (NetworkEvents_1.NetworkEvents.HELLO === message.event) {
                        this.evaluateHello(message.data, message, rinfo);
                    }
                    else {
                        this.emit(message.event, message.data, message, rinfo);
                    }
                }
                else {
                    this.emit("message", message);
                }
            });
            this.running = true;
            this.checkId = setInterval(() => {
                const ids = Object.keys(this.nodes);
                for (const id of ids) {
                    const node = this.nodes[id];
                    const time = +new Date() - node.lastSeen;
                    if (time > (node.isMaster ? this.options.masterTimeout : this.options.nodeTimeout)) {
                        // we haven't seen the node recently
                        // delete the node from our nodes list
                        delete this.nodes[id];
                        this.emit(Events_1.Events.REMOVED, node);
                    }
                }
                this.emit(Events_1.Events.CHECK);
            }, this.getCheckInterval());
            if (this.options.server) {
                // send hello every helloInterval
                this.helloId = setInterval(() => this.hello(), this.getHelloInterval());
                this.hello();
            }
            this.emit(Events_1.Events.STARTED, this);
            return callback && callback(null, true);
        });
    }
    /**
     * Promote the instance to master.
     * This causes the old master to demote.
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * d.promote();
     * ```
     */
    promote() {
        this.me.isMasterEligible = true;
        this.me.isMaster = true;
        this.emit(Events_1.Events.PROMOTION, this.me);
        this.hello();
    }
    /**
     * Demote the instance from being a master.
     * This causes another node to become master
     *
     * @example
     * ```js
     * const { Dicover } = require('node-discover');
     * var d = new Discover();
     *
     * d.demote(); //this node is still eligible to become a master node.
     *
     * // or
     *
     * d.demote(true); //this node is no longer eligible to become a master node.
     * ```
     * @param {boolean} permanent  if true it specify that this node should not automatically become master again.
     */
    demote(permanent = false) {
        this.me.isMasterEligible = !permanent;
        this.me.isMaster = false;
        this.emit(Events_1.Events.DEMOTION, this.me);
        this.hello();
    }
    master(node) {
        this.emit(Events_1.Events.MASTER, node);
    }
    hello() {
        this.options.network.send(NetworkEvents_1.NetworkEvents.HELLO, { iid: this.id, data: this.me });
        this.emit(Events_1.Events.HELLO_EMITTED);
    }
    /**
     * Advertise an object or message with each hello packet; this is completely arbitrary.
     * Make this object/message whatever applies to your application that you want your nodes to know about the other nodes.
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * d.advertise({
     *   localServices : [
     *     { type : 'http', port : '9911', description : 'my awesome http server' },
     *     { type : 'smtp', port : '25', description : 'smtp server' },
     *   ]
     * });
     *
     * // or
     *
     * d.advertise("i love nodejs");
     *
     * // or
     *
     * d.advertise({ something : "something" });
     * ```
     * @param advertisement
     */
    advertise(advertisement) {
        this.me.advertisement = advertisement;
    }
    /**
     * For each node execute given callback
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * d.eachNode(function (node) {
     *   if (node.advertisement == "i love nodejs") {
     *     console.log("nodejs loves this node too");
     *   }
     * });
     * ```
     * @param {(node: Node) => void} callback
     */
    eachNode(callback) {
        const ids = Object.keys(this.nodes);
        for (const id of ids) {
            callback(this.nodes[id]);
        }
    }
    /**
     * Join a channel on which to receive messages/objects
     *
     * **Reserved channels**
     *
     * - promotion
     * - demotion
     * - added
     * - removed
     * - master
     * - hello
     * - helloReceived
     * - helloEmitted
     *
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * // Pass the channel and the callback function for handling received data from that channel
     * const success = d.join("config-updates", data => {
     *   if (data.redisMaster) {
     *     // connect to the new redis master
     *   }
     * });
     *
     * if (!success) {
     *   // could not join that channel; probably because it is reserved
     * }
     * ```
     * @param {string | Channel} channel
     * @param {AsyncCallback<ChannelsType
     * [Channel]>} callback
     * @returns {boolean}
     */
    join(channel, callback) {
        if (~internal_1.RESERVED_EVENTS.indexOf(channel)) {
            return false;
        }
        if (~this.channels.indexOf(channel)) {
            return false;
        }
        if (callback) {
            this.on(channel, callback);
        }
        this.channels.push(channel);
        return true;
    }
    /**
     * Leave a channel
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * // Pass the channel which we want to leave
     * const success = d.leave("config-updates");
     *
     * if (!success) {
     *   // could leave channel; who cares?
     * }
     * ```
     * @param {string} channel
     * @returns {boolean}
     */
    leave(channel) {
        if (~internal_1.RESERVED_EVENTS.indexOf(channel)) {
            return false;
        }
        this.removeAllListeners(channel);
        const index = this.channels.indexOf(channel);
        if (index !== -1) {
            this.channels.splice(index);
        }
        return true;
    }
    /**
     * Send a message/object on a specific channel
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * const success = d.send("config-updates", { redisMaster : "10.0.1.4" });
     *
     * if (!succes) {
     *   // could not send on that channel; probably because it is reserved
     * }
     * ```
     *
     * @param {ChannelName} channel
     * @param {ChannelsType[ChannelName]} data
     * @returns {boolean}
     */
    send(channel, data) {
        if (~internal_1.RESERVED_EVENTS.indexOf(channel)) {
            return false;
        }
        this.options.network.send(channel, {
            iid: this.id,
            data,
        });
        return true;
    }
    /**
     * Stop broadcasting hello packets and checking for missing nodes
     *
     * @example
     * ```js
     * const { Discover } = require('node-discover');
     * const d = new Discover();
     *
     * d.stop();
     * ```
     */
    stop() {
        if (!this.running) {
            return;
        }
        this.options.network.stop();
        if (this.checkId) {
            clearInterval(this.checkId);
        }
        if (this.helloId) {
            clearInterval(this.helloId);
        }
        this.emit(Events_1.Events.STOPPED, this);
        this.running = false;
    }
    evaluateHello(data, message, rinfo) {
        // prevent processing hello message from self
        if (message.iid === this.id) {
            return;
        }
        const id = message.iid;
        const node = {
            ...data,
            lastSeen: +new Date(),
            address: rinfo.address,
            hostname: message.hostname,
            port: rinfo.port,
            id,
        };
        const isNew = !this.nodes[id];
        let wasMaster = null;
        if (!isNew) {
            wasMaster = this.nodes[id].isMaster;
        }
        this.nodes[id] = node;
        if (isNew) {
            // new node found
            this.emit(Events_1.Events.ADDED, node, message, rinfo);
        }
        if (node.isMaster) {
            // if we have this node and it was not previously a master then it is a new master node
            if ((isNew || !wasMaster)) {
                // this is a new master
                this.emit(Events_1.Events.MASTER, node, message, rinfo);
            }
        }
        this.emit(Events_1.Events.HELLO_RECEIVED, node, message, rinfo, isNew, wasMaster);
    }
    getCheckInterval() {
        if (typeof this.options.checkInterval === "function") {
            return this.options.checkInterval.call(this);
        }
        return this.options.checkInterval;
    }
    getHelloInterval() {
        if (typeof this.options.helloInterval === "function") {
            return this.options.helloInterval.call(this);
        }
        return this.options.helloInterval;
    }
}
exports.Discover = Discover;
/**
 * This is the default automatically assigned weight function in the case that
 * you do not specify a weight, this function will be called. You can override
 * this function if you want to change the default behavior.
 *
 * @example
 * ```ts
 * import Discover from "node-discover";
 *
 * Discover.weight = () => {
 *     return Math.random();
 * }
 *
 * const d = new Discover();
 * ```
 *
 * @returns {number}
 */
Discover.weight = () => {
    // default to negative, decimal now value
    return -(Date.now() / Math.pow(10, String(Date.now()).length));
};
//# sourceMappingURL=Discover.js.map