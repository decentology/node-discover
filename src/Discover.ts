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

export class Discover extends EventEmitter {

    public options: DiscoverOptions;

    public me: MeNode;

    public nodes: NodeMapping = {};

    private broadcast: Network;

    private channels: string[] = [];

    private evaluateHello: (data: Node, message: Message, rinfo: dgram.RemoteInfo) => void;

    private check: () => void;

    private running: boolean = false;

    private stop: () => void;

    private start: (callback?: AsyncCallback<boolean>) => void;

    private leadershipElector?: LeadershipElectionInterface;

    constructor();

    constructor(callback: ReadyCallback);

    constructor(options: Partial<DiscoverOptions>);

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
                this.emit("added", node, message, rinfo);
            }

            if (node.isMaster) {
                // if we have this node and it was not previously a master then it is a new master node
                if ((isNew || !wasMaster)) {
                    // this is a new master
                    this.emit("master", node, message, rinfo);
                }
            }

            this.emit("helloReceived", node, message, rinfo, isNew, wasMaster);
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
                    this.emit("removed", node);
                }
            }

            this.emit("check");
        };

        let checkId: NodeJS.Timeout | null = null;

        let helloId: NodeJS.Timeout | null = null;

        this.start = (callback?: AsyncCallback<boolean>) => {
            if (this.running) {
                callback && callback(null, false);

                return;
            }

            this.broadcast.start((error: Error | null) => {
                if (error) {
                    return callback && callback(error, null);
                }

                this.running = true;

                checkId = setInterval(this.check, checkInterval());

                if (this.options.server) {
                    //send hello every helloInterval
                    helloId = setInterval(() => this.hello(), helloInterval());

                    this.hello();
                }

                this.emit("started", this);

                return callback && callback(null, true);
            });
        };

        this.stop = () => {
            if (!this.running) {
                return;
            }

            this.broadcast.stop();

            if (checkId) {
                clearInterval(checkId);
            }

            if (helloId) {
                clearInterval(helloId);
            }

            this.emit("stopped", this);

            this.running = false;
        };

        //check if auto start is enabled
        if (this.options.start) {
            this.start(callback);
        }

        const helloInterval = () => {
            if (typeof this.options.helloInterval === "function") {
                return this.options.helloInterval.call(this);
            }

            return this.options.helloInterval;
        };

        const checkInterval = () => {
            if (typeof this.options.checkInterval === "function") {
                return this.options.checkInterval.call(this);
            }

            return this.options.checkInterval;
        };
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

    public promote() {
        this.me.isMasterEligible = true;
        this.me.isMaster = true;
        this.emit("promotion", this.me);
        this.hello();
    }

    public demote(permanent = false) {
        this.me.isMasterEligible = !permanent;
        this.me.isMaster = false;
        this.emit("demotion", this.me);
        this.hello();
    }

    public master(node: Node) {
        this.emit("master", node);
    }

    public hello(): void {
        this.broadcast.send("hello", this.me);
        this.emit("helloEmitted");
    }

    public advertise(advertisement: unknown) {
        this.me.advertisement = advertisement;
    }

    public eachNode(callback: (node: Node) => void) {
        const ids = Object.keys(this.nodes);

        for (const id of ids) {
            callback(this.nodes[id]);
        }
    }

    public join(channel: string, callback: AsyncCallback<any>) {
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

    public leave(channel: string) {
        this.broadcast.removeAllListeners(channel);

        const index = this.channels.indexOf(channel);

        if (index !== -1) {
            this.channels.splice(index);
        }

        return true;
    }

    public send(channel: string, data: unknown) {
        if (~RESERVED_EVENTS.indexOf(channel)) {
            return false;
        }

        this.broadcast.send(channel, data);

        return true;
    }
}
