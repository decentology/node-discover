import { Discover } from "../Discover";
import { LeadershipElectionInterface } from "./LeadershipElectionInterface";

/**
 * @category Election
 */
export interface LeadershipElectionConstructable {
    new(discover: Discover): LeadershipElectionInterface;
}
