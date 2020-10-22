export interface MulticastNetworkOptions {
    /**
     * Multicast address if using multicast
     *
     * @default - (don't use multicast, use broadcast)
     */
    multicast: string;

    /**
     * Multicast TTL for when using multicast
     *
     * @default 1
     */
    multicastTTL: number;
}
