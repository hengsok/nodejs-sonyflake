interface Config {
    customEpoch?: number;
    returnNumber?: boolean;
    machineID?: number;
}
/**
 * Constructs a UniqueID object which stores method for generation
 * of a unique 64 bit time sortable id and a method for retreiving
 * time of creation for the ids
 *
 * @param {config} config
 * in ms, defaults to 1546300800000 (01-01-2019)
 *
 * ```
 * const uid = new UniqueID();
 * const ID = uid.getUniqueID();
 * const IDCreateAt = uid.getTimestampFromID(ID);
 * ```
 */
export declare class UniqueID {
    private _CUSTOM_EPOCH;
    private _snowflake;
    private _MACHINE_ID;
    private returnNumber;
    constructor(config?: Config);
    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {string | bigint} the unique id
     */
    getUniqueID(): string | bigint;
    /**
     * Promisified unique id function
     * @returns {Promise<string | number>} promise to a unique 64 bit long id
     */
    asyncGetUniqueID(): Promise<string | bigint>;
    /**
     * Retrieves the epoch/unix timestamp at which the ID was generated
     * irrespective of the machine it was generated on, PROVIDED no or same
     * custom epoch was used in generation
     * @param {number | string} id generated through getUniqueID method
     * @returns {number} timestamp of id creations
     */
    getTimestampFromID(id: bigint | string): number;
    /**
     * Retrieves the 12 bit machine id where the id was generated,
     * irrespective of the machine it was generated on.
     * @param {bigint | string} id unique ID
     * @returns {number} machine ID
     */
    getMachineIDFromID(id: bigint | string): number;
    /**
     * getIDFromTimestamp generates an ID corresponding to the given timestamp
     *
     * This ID is generated with sequence number 0
     *
     * Ideal for use cases where a database query requires to entries created after some timestamp
     * @param {number | string} timestamp timestamp corresponding to which an ID is required
     * @returns {bigint} ID corresponding to the timestamp
     */
    getIDFromTimestamp(timestamp: number | string): bigint;
    /**
     * Machine ID of the current machine. This ID is of 12 bit.
     * This can be either provided by the user (preferred) or will be assigned
     * randomly.
     */
    get machineID(): number;
}
export {};
//# sourceMappingURL=generateUniqueID.d.ts.map