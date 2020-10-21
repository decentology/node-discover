export interface MeNode {
    address: string;

    isMaster: boolean;

    advertisement: unknown;

    weight: number;

    isMasterEligible: boolean;
}
