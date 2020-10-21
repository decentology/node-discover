/**
 * @category Discover
 */
export interface MeNode<AdvertisementType = unknown> {
    address: string;

    isMaster: boolean;

    advertisement: AdvertisementType;

    weight: number;

    isMasterEligible: boolean;
}
