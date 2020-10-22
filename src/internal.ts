import { v4 as uuidv4 } from "uuid";

/**
 * @internal
 * @hidden
 */
export const PROCESS_UUID = uuidv4();

/**
 * @internal
 * @hidden
 */
export const RESERVED_EVENTS = ["promotion", "demotion", "added", "removed", "master", "hello", "helloReceived", "helloEmitted"];
