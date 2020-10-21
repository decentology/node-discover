import { EventEmitter } from "events";
import { DiscoverOptions } from "./DiscoverOptions";
import { DEFAULT_DISCOVER_OPTIONS, RESERVED_EVENTS } from "./globals";
import { Network } from "./Network/Network";
import * as dgram from "dgram";
import { Message } from "./Network/Message";
import { AsyncCallback } from "./Types/AsyncCallback";
import { Node } from "./Types/Node";
import { MeNode } from "./Types/MeNode";
import { resolveLeadership } from "./Election/resolveLeadership";
import { LeadershipElectionInterface } from "./Election/LeadershipElectionInterface";
import { ReadyCallback } from "./Types/ReadyCallback";
import { NodeMapping } from "./Types/NodeMapping";
import { Events } from "./Events";

export class Discover extends EventEmitter {

    public options: DiscoverOptions;

    public me: MeNode;

    public nodes: NodeMapping = {};

    public broadcast: Network;

    public channels: string[] = [];

    public evaluateHello: (data: Node, message: Message, rinfo: dgram.RemoteInfo) => void;

    public check: () => void;

    public running: boolean = false;

    public leadershipElector?: LeadershipElectionInterface;

    private checkId: NodeJS.Timeout | null = null;

    private helloId: NodeJS.Timeout | null = null;

    constructor();

    /**
     *
     * @param {ReadyCallback} callback function that is called when everything is up and running
     */
    constructor(callback: ReadyCallback);

    constructor(options: Partial<DiscoverOptions>);

    /**
     *
     * @param {Partial<DiscoverOptions>} options
     * @param {ReadyCallback} callback function that is called when everything is up and running
     */
    constructor(options: Partial<DiscoverOptions>, callback: ReadyCallback);

    constructor(opts?: Partial<DiscoverOptions> | ReadyCallback, readyCallback?: ReadyCallback) {
        super();

        const options: Partial<DiscoverOptions> = typeof opts === "function" ? {} : (opts || {});
        const callback: ReadyCallback | null = typeof opts === "function" ? opts as ReadyCallback : (readyCallback as ReadyCallback || null);

        this.options = {
            ...DEFAULT_DISCOVER_OPTIONS,
            masterTimeout: options.nodeTimeout || 2000,
            weight: Discover.weight(),
            client: options.client || (!options.client && !options.server),
            server: options.server || (!options.client && !options.server),
            ...options,
        };

        this.leadershipElector = resolveLeadership(this.options.leadershipElector, this);

        if (!(this.options.nodeTimeout >= this.options.checkInterval)) {
            throw new Error("nodeTimeout must be greater than or equal to checkInterval.");
        }

        if (!(this.options.masterTimeout >= this.options.nodeTimeout)) {
            throw new Error("masterTimeout must be greater than or equal to nodeTimeout.");
        }

        this.broadcast = new Network({
            ...this.options,
        });

        this.me = {
            isMaster: false,
            isMasterEligible: this.options.server,
            weight: this.options.weight,
            address: "127.0.0.1", //TODO: get the real local address?
            advertisement: this.options.advertisement,
        };

        this.evaluateHello = (data: MeNode, message: Message, rinfo: dgram.RemoteInfo) => {
            // prevent processing hello message from self
            if (message.iid === this.broadcast.getInstanceUuid()) {
                return;
            }

            const id = message.iid;

            const node: Node = {
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
                this.emit(Events.ADDED, node, message, rinfo);
            }

            if (node.isMaster) {
                // if we have this node and it was not previously a master then it is a new master node
                if ((isNew || !wasMaster)) {
                    // this is a new master
                    this.emit(Events.MASTER, node, message, rinfo);
                }
            }

            this.emit(Events.HELLO_RECEIVED, node, message, rinfo, isNew, wasMaster);
        };

        this.broadcast.on("hello", this.evaluateHello);
        this.broadcast.on("error", (error) => {
            this.emit("error", error);
        });

        this.check = () => {
            const ids = Object.keys(this.nodes);
            for (const id of ids) {
                const node = this.nodes[id];
                const time = +new Date() - node.lastSeen;

                if (time > (node.isMaster ? this.options.masterTimeout : this.options.nodeTimeout)) {
                    // we haven't seen the node recently
                    // delete the node from our nodes list
                    delete this.nodes[id];
                    this.emit(Events.REMOVED, node);
                }
            }

            this.emit("check");
        };

        //check if auto start is enabled
        if (this.options.start) {
            this.start(callback);
        }
    }

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
    public static weight: () => number = () => {
        //default to negative, decimal now value
        return -(Date.now() / Math.pow(10, String(Date.now()).length));
    };

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
    public start(callback?: AsyncCallback<boolean>) {
        if (this.running) {
            callback && callback(null, false);

            return;
        }

        this.broadcast.start((error: Error | null) => {
            if (error) {
                return callback && callback(error, null);
            }

            this.running = true;

            this.checkId = setInterval(this.check, this.getCheckInterval());

            if (this.options.server) {
                //send hello every helloInterval
                this.helloId = setInterval(() => this.hello(), this.getHelloInterval());

                this.hello();
            }

            this.emit("started", this);

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
    public promote() {
        this.me.isMasterEligible = true;
        this.me.isMaster = true;
        this.emit(Events.PROMOTION, this.me);
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
    public demote(permanent = false) {
        this.me.isMasterEligible = !permanent;
        this.me.isMaster = false;
        this.emit(Events.DEMOTION, this.me);
        this.hello();
    }

    public master(node: Node) {
        this.emit(Events.MASTER, node);
    }

    public hello(): void {
        this.broadcast.send("hello", this.me);
        this.emit(Events.HELLO_EMITTED);
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
    public advertise(advertisement: unknown) {
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
    public eachNode(callback: (node: Node) => void) {
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
     * @param {string} channel
     * @param {AsyncCallback<DataType>} callback
     * @returns {boolean}
     */
    public join<DataType>(channel: string, callback: AsyncCallback<DataType>) {
        if (~RESERVED_EVENTS.indexOf(channel)) {
            return false;
        }

        if (~this.channels.indexOf(channel)) {
            return false;
        }

        if (callback) {
            this.on(channel, callback);
        }

        this.broadcast.on(channel, (data, obj, rinfo) => {
            this.emit(channel, data, obj, rinfo);
        });

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
    public leave(channel: string) {
        this.broadcast.removeAllListeners(channel);

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
     * @param {string} channel
     * @param data
     * @returns {boolean}
     */
    public send(channel: string, data: unknown) {
        if (~RESERVED_EVENTS.indexOf(channel)) {
            return false;
        }

        this.broadcast.send(channel, data);

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
    public stop() {
        if (!this.running) {
            return;
        }

        this.broadcast.stop();

        if (this.checkId) {
            clearInterval(this.checkId);
        }

        if (this.helloId) {
            clearInterval(this.helloId);
        }

        this.emit("stopped", this);

        this.running = false;
    }

    private getCheckInterval(): number {
        if (typeof this.options.checkInterval === "function") {
            return this.options.checkInterval.call(this);
        }

        return this.options.checkInterval;
    }

    private getHelloInterval(): number {
        if (typeof this.options.helloInterval === "function") {
            return this.options.helloInterval.call(this);
        }

        return this.options.helloInterval;
    }
}
