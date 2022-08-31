"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeToken = void 0;
const baseCurrency_1 = require("./baseCurrency");
class NativeToken extends baseCurrency_1.BaseCurrency {
    constructor() {
        super(...arguments);
        this.isNativeToken = true;
        this.isToken = false;
    }
}
exports.NativeToken = NativeToken;
/**
 * The only instance of the base class `Currency`.
 */
NativeToken.Instance = new NativeToken(18, "WDOGE", "Wrapped Dogecoin");
