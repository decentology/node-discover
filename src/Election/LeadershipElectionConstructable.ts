import { Discover } from "../Discover";
import { LeadershipElectionInterface } from "./LeadershipElectionInterface";

export interface LeadershipElectionConstructable {
    new(discover: Discover): LeadershipElectionInterface;
}
