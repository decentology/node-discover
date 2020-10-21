import { v4 as uuidv4 } from "uuid";
import os from "os";
import { NetworkOptions } from "./Network/NetworkOptions";
import { DiscoverOptions } from "./Discover/DiscoverOptions";

/**
 * @internal
 * @hidden
 */
export const PROCESS_UUID = uuidv4();

/**
 * @internal
 * @hidden
 */
export const RESERVED_EVENTS = ["promotion", "demotion", "added", "removed", "master", "hello"];

/**
 * @internal
 * @hidden
 */
export const DEFAULT_NETWORK_OPTIONS: NetworkOptions = {
    address: "0.0.0.0",
    port: 12345,
    broadcast: null,
    multicast: null,
    multicastTTL: 1,
    unicast: null,
    key: null,
    exclusive: false,
    reuseAddr: true,
    ignoreProcess: true,
    ignoreInstance: true,
    hostname: process.env.DISCOVERY_HOSTNAME ?? os.hostname(),
};

/**
 * @internal
 * @hidden
 */
export const DEFAULT_DISCOVER_OPTIONS: DiscoverOptions = {
    ...DEFAULT_NETWORK_OPTIONS,
    helloInterval: 1000,
    checkInterval: 2000,
    nodeTimeout: 2000,
    address: "0.0.0.0",
    port: 12345,
    broadcast: null,
    multicast: null,
    multicastTTL: 1,
    unicast: null,
    key: null,
    mastersRequired: 1,
    leadershipElector: null,
    reuseAddr: true,
    exclusive: false,
    ignoreProcess: true,
    ignoreInstance: true,
    start: true,
    hostname: process.env.DISCOVERY_HOSTNAME ?? os.hostname(),
    server: true,
    client: false,
    masterTimeout: 2000,
    weight: -(Date.now() / Math.pow(10, String(Date.now()).length)),
    advertisement: null,
};
