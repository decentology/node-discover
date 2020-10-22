export interface MeNode<AdvertisementType = unknown> {
    address: string;

    isMaster: boolean;

    advertisement: AdvertisementType | null;

    weight: number;

    isMasterEligible: boolean;
}
