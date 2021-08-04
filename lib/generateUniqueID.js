"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueID = void 0;
var isFalsy_1 = __importDefault(require("./isFalsy"));
var Snowflake = require("../build/Release/snowflake").Snowflake;
var CUSTOM_EPOCH = 1546300800000; // 01-01-2019
var MAX_MACHINE_ID = (1 << 12) - 1;
var initConfig = {
    customEpoch: CUSTOM_EPOCH,
    returnNumber: false,
};
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
var UniqueID = /** @class */ (function () {
    function UniqueID(config) {
        if (config === void 0) { config = initConfig; }
        this.returnNumber = true;
        this._CUSTOM_EPOCH = config.customEpoch || CUSTOM_EPOCH;
        this.returnNumber = !!config.returnNumber;
        this._MACHINE_ID = getMachineID(config.machineID);
        this._snowflake = new Snowflake(this._CUSTOM_EPOCH, this._MACHINE_ID);
    }
    /**
     * Generates a unique time sortable 64 bit number using native code
     * @returns {string | bigint} the unique id
     */
    UniqueID.prototype.getUniqueID = function () {
        var val = this._snowflake.getUniqueID();
        if (!this.returnNumber)
            return val.toString();
        return val;
    };
    /**
     * Promisified unique id function
     * @returns {Promise<string | number>} promise to a unique 64 bit long id
     */
    UniqueID.prototype.asyncGetUniqueID = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return resolve(_this.getUniqueID()); })];
            });
        });
    };
    /**
     * Retrieves the epoch/unix timestamp at which the ID was generated
     * irrespective of the machine it was generated on, PROVIDED no or same
     * custom epoch was used in generation
     * @param {number | string} id generated through getUniqueID method
     * @returns {number} timestamp of id creations
     */
    UniqueID.prototype.getTimestampFromID = function (id) {
        return this._snowflake.getTimestampFromID(id);
    };
    /**
     * Retrieves the 12 bit machine id where the id was generated,
     * irrespective of the machine it was generated on.
     * @param {bigint | string} id unique ID
     * @returns {number} machine ID
     */
    UniqueID.prototype.getMachineIDFromID = function (id) {
        return this._snowflake.getNodeIDFromID(id);
    };
    /**
     * getIDFromTimestamp generates an ID corresponding to the given timestamp
     *
     * This ID is generated with sequence number 0
     *
     * Ideal for use cases where a database query requires to entries created after some timestamp
     * @param {number | string} timestamp timestamp corresponding to which an ID is required
     * @returns {bigint} ID corresponding to the timestamp
     */
    UniqueID.prototype.getIDFromTimestamp = function (timestamp) {
        return this._snowflake.getIDFromTimestamp(timestamp);
    };
    Object.defineProperty(UniqueID.prototype, "machineID", {
        /**
         * Machine ID of the current machine. This ID is of 12 bit.
         * This can be either provided by the user (preferred) or will be assigned
         * randomly.
         */
        get: function () {
            return this._MACHINE_ID;
        },
        enumerable: false,
        configurable: true
    });
    return UniqueID;
}());
exports.UniqueID = UniqueID;
/**
 * getMachineID takes in a machine id and verifies if it withstand
 * the following contraints:
 *
 * 1. Should not be "falsy" but could be 0
 * 2. Should be of type "number"
 * 3. Is a whole number
 * 4. Doesn't exceeds the limit of 4095
 *
 * It will return a random value ε [0, 4095] if parameter is
 * undefined
 * @param mid machine id
 */
function getMachineID(mid) {
    var id = 0;
    if (isFalsy_1.default(mid) || typeof mid !== "number")
        id = Math.floor(Math.random() * MAX_MACHINE_ID);
    else
        id = mid;
    verifyMachineID(id);
    return id;
}
function verifyMachineID(mid) {
    if (!Number.isInteger(mid))
        throw Error("Machine Id should be a decimal number");
    if (mid > MAX_MACHINE_ID)
        throw Error("Maximum value of machine id can be 2^12 - 1 (4095)");
}
//# sourceMappingURL=generateUniqueID.js.map