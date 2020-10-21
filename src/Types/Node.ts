export interface Node {
    address: string;

    isMaster: boolean;

    advertisement: unknown;

    weight: number;

    isMasterEligible: boolean;

    lastSeen: number;

    hostname: string;

    port: number;

    id: string;
}
