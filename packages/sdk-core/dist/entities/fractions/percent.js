"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsbi_1 = __importDefault(require("jsbi"));
const fraction_1 = __importDefault(require("./fraction"));
const _100_PERCENT = new fraction_1.default(jsbi_1.default.BigInt(100));
class Percent extends fraction_1.default {
    toSignificant(significantDigits = 5, format, rounding) {
        return this.multiply(_100_PERCENT).toSignificant(significantDigits, format, rounding);
    }
    toFixed(decimalPlaces = 2, format, rounding) {
        return this.multiply(_100_PERCENT).toFixed(decimalPlaces, format, rounding);
    }
}
exports.default = Percent;
