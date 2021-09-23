/// <reference types="node" />
import { DiscoverOptions } from "./DiscoverOptions";
import { AsyncCallback, AsyncNoopCallback } from "../Types/AsyncCallback";
import { Node } from "./Node";
import { MeNode } from "./MeNode";
import { NodeMapping } from "./NodeMapping";
import { EventEmitter } from "events";
export declare class Discover<AdvertisementType = unknown, ChannelsType extends object = {}> extends EventEmitter {
    private options;
    private id;
    private me;
    private nodes;
    private channels;
    private running;
    private checkId;
    private helloId;
    constructor();
    /**
     * @param {AsyncNoopCallback} callback function that is called when everything is up and running
     */
    constructor(callback: AsyncNoopCallback);
    /**
     * @param {Partial<DiscoverOptions>} options
     */
    constructor(options: Partial<DiscoverOptions<AdvertisementType, ChannelsType>>);
    /**
     * @param {Partial<DiscoverOptions>} options
     * @param {AsyncNoopCallback} callback function that is called when everything is up and running
     */
    constructor(options: Partial<DiscoverOptions<AdvertisementType, ChannelsType>>, callback: AsyncNoopCallback);
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
    static weight: () => number;
    getId(): string;
    getOptions(): DiscoverOptions;
    isRunning(): boolean;
    getChannels(): string[];
    getMe(): MeNode;
    getNodes(): NodeMapping;
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
    start(callback?: AsyncCallback<boolean>): void;
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
    promote(): void;
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
    demote(permanent?: boolean): void;
    master(node: Node): void;
    hello(): void;
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
    advertise(advertisement: AdvertisementType): void;
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
    eachNode(callback: (node: Node) => void): void;
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
    join<Channel extends keyof ChannelsType>(channel: Channel | string, callback: AsyncCallback<ChannelsType[Channel]>): boolean;
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
    leave<Channel extends keyof ChannelsType>(channel: Channel | string): boolean;
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
    send<ChannelName extends keyof ChannelsType>(channel: ChannelName, data: ChannelsType[ChannelName]): boolean;
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
    stop(): void;
    private evaluateHello;
    private getCheckInterval;
    private getHelloInterval;
}
