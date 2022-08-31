"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const validateAndParseAddress_1 = __importDefault(require("../utils/validateAndParseAddress"));
const baseCurrency_1 = require("./baseCurrency");
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
class Token extends baseCurrency_1.BaseCurrency {
    constructor(chainId, address, decimals, symbol, name) {
        super(decimals, symbol, name);
        this.isNativeToken = false;
        this.isToken = true;
        this.chainId = chainId;
        this.address = (0, validateAndParseAddress_1.default)(address);
    }
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other) {
        // short circuit on reference equality
        if (this === other) {
            return true;
        }
        return this.chainId === other.chainId && this.address === other.address;
    }
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other) {
        (0, tiny_invariant_1.default)(this.chainId === other.chainId, "CHAIN_IDS");
        (0, tiny_invariant_1.default)(this.address !== other.address, "ADDRESSES");
        return this.address.toLowerCase() < other.address.toLowerCase();
    }
}
exports.Token = Token;
