"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseCurrency = void 0;
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
/**
 * A currency is any fungible financial instrument on Dogechain, including Dogechain and all ERC20 tokens.
 *
 * The only instance of the base class `Currency` is Dogechain.
 */
class BaseCurrency {
    /**
     * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.NativeToken.Instance`.
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    constructor(decimals, symbol, name) {
        (0, tiny_invariant_1.default)(decimals >= 0 && decimals < 255 && Number.isInteger(decimals), "DECIMALS");
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
    }
}
exports.BaseCurrency = BaseCurrency;
