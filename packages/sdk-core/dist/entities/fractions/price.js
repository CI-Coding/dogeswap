"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsbi_1 = __importDefault(require("jsbi"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const utils_1 = require("../../utils");
const currencyAmount_1 = __importDefault(require("./currencyAmount"));
const fraction_1 = __importDefault(require("./fraction"));
class Price extends fraction_1.default {
    // denominator and numerator _must_ be raw, i.e. in the native representation
    constructor(baseCurrency, quoteCurrency, denominator, numerator) {
        super(numerator, denominator);
        this.baseCurrency = baseCurrency;
        this.quoteCurrency = quoteCurrency;
        this.scalar = new fraction_1.default(jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(baseCurrency.decimals)), jsbi_1.default.exponentiate(jsbi_1.default.BigInt(10), jsbi_1.default.BigInt(quoteCurrency.decimals)));
    }
    get raw() {
        return new fraction_1.default(this.numerator, this.denominator);
    }
    get adjusted() {
        return super.multiply(this.scalar);
    }
    invert() {
        return new Price(this.quoteCurrency, this.baseCurrency, this.numerator, this.denominator);
    }
    multiply(other) {
        (0, tiny_invariant_1.default)((0, utils_1.currencyEquals)(this.quoteCurrency, other.baseCurrency), "TOKEN");
        const fraction = super.multiply(other);
        return new Price(this.baseCurrency, other.quoteCurrency, fraction.denominator, fraction.numerator);
    }
    // quotes with floor division
    quote(currencyAmount) {
        (0, tiny_invariant_1.default)((0, utils_1.currencyEquals)(currencyAmount.currency, this.baseCurrency), "TOKEN");
        return new currencyAmount_1.default(this.quoteCurrency, super.multiply(currencyAmount.raw).quotient);
    }
    toSignificant(significantDigits = 6, format, rounding) {
        return this.adjusted.toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = 4, format, rounding) {
        return this.adjusted.toFixed(decimalPlaces, format, rounding);
    }
}
exports.default = Price;
