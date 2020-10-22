import { MeNode } from "./MeNode";

/**
 * @example
 * ```json
 * {
 *   isMaster: true,
 *   isMasterEligible: true,
 *   advertisement: null,
 *   lastSeen: 1317323922551,
 *   address: '10.0.0.1',
 *   port: 12345,
 *   id: '31d39c91d4dfd7cdaa56738de8240bc4',
 *   hostName : 'myMachine'
 * }
 * ```
 */
export interface Node<AdvertisementType = unknown> extends MeNode<AdvertisementType> {
    lastSeen: number;

    hostname: string;

    port: number;

    id: string;
}
