/**
 * Each event is passed the `Node Object` for which the event is occurring.
 */
export enum Events {
    /**
     * Triggered when the node has been promoted to a master.
     *
     * - Could happen by calling the promote() method
     * - Could happen by the current master instance being demoted and this instance automatically being promoted
     * - Could happen by the current master instance dying and this instance automatically being promoted
     *
     * @type {Events.PROMOTION}
     */
    PROMOTION = "promotion",

    /**
     * Triggered when the node is no longer a master.
     *
     * - Could happen by calling the demote() method
     * - Could happen by another node promoting itself to master
     *
     * @type {Events.DEMOTION}
     */
    DEMOTION = "demotion",

    /**
     * Triggered when a new node is discovered
     *
     * @type {Events.ADDED}
     */
    ADDED = "added",

    /**
     * Triggered when a new node is not heard from within `nodeTimeout`
     *
     * @type {Events.REMOVED}
     */
    REMOVED = "removed",

    /**
     * Triggered when a new master has been selected
     *
     * @type {Events.MASTER}
     */
    MASTER = "master",

    /**
     * Triggered when the node has received a hello from given one
     *
     * @type {Events.HELLO_RECEIVED}
     */
    HELLO_RECEIVED = "helloReceived",

    /**
     * Triggered when the node sends a hello packet
     *
     * @type {Events.HELLO_EMITTED}
     */
    HELLO_EMITTED = "helloEmitted",

    /**
     * Triggered when discover started
     *
     * @type {Events.STARTED}
     */
    STARTED = "started",

    /**
     * Triggered when discover stopped
     *
     * @type {Events.STOPPED}
     */
    STOPPED = "stopped",

    /**
     * @type {Events.CHECK}
     */
    CHECK = "check",
}
