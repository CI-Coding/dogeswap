"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const big_js_1 = __importDefault(require("big.js"));
const jsbi_1 = __importDefault(require("jsbi"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const toformat_1 = __importDefault(require("toformat"));
const utils_1 = require("../../utils");
const constants_1 = require("../../constants");
const NativeToken_1 = require("../NativeToken");
const fraction_1 = __importDefault(require("./fraction"));
const Big = (0, toformat_1.default)(big_js_1.default);
class CurrencyAmount extends fraction_1.default {
    // amount _must_ be raw, i.e. in the native representation
    constructor(currency, amount) {
        const parsedAmount = jsbi_1.default.BigInt(amount);
        (0, tiny_invariant_1.default)(jsbi_1.default.lessThanOrEqual(parsedAmount, constants_1.MaxUint256), "AMOUNT");
        super(parsedAmount, jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(currency.decimals)));
        this.currency = currency;
    }
    /**
     * Helper that calls the constructor with the NativeToken.Instance currency
     * @param amount Dogechain amount in wei
     */
    static dogechain(amount) {
        return new CurrencyAmount(NativeToken_1.NativeToken.Instance, amount);
    }
    get raw() {
        return this.numerator;
    }
    add(other) {
        (0, tiny_invariant_1.default)((0, utils_1.currencyEquals)(this.currency, other.currency), "TOKEN");
        return new CurrencyAmount(this.currency, jsbi_1.default.add(this.raw, other.raw));
    }
    subtract(other) {
        (0, tiny_invariant_1.default)((0, utils_1.currencyEquals)(this.currency, other.currency), "TOKEN");
        return new CurrencyAmount(this.currency, jsbi_1.default.subtract(this.raw, other.raw));
    }
    toSignificant(significantDigits = 6, format, rounding = constants_1.Rounding.ROUND_DOWN) {
        return super.toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = this.currency.decimals, format, rounding = constants_1.Rounding.ROUND_DOWN) {
        (0, tiny_invariant_1.default)(decimalPlaces <= this.currency.decimals, "DECIMALS");
        return super.toFixed(decimalPlaces, format, rounding);
    }
    toExact(format = { groupSeparator: "" }) {
        Big.DP = this.currency.decimals;
        return new Big(this.numerator.toString()).div(this.denominator.toString()).toFormat(format);
    }
}
exports.default = CurrencyAmount;
