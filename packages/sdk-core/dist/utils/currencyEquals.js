"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyEquals = void 0;
/**
 * Compares two currencies for equality
 */
function currencyEquals(currencyA, currencyB) {
    if (currencyA.isToken && currencyB.isToken) {
        return currencyA.equals(currencyB);
    }
    else if (currencyA.isToken) {
        return false;
    }
    else if (currencyB.isToken) {
        return false;
    }
    else {
        return currencyA.isNativeToken === currencyB.isNativeToken;
    }
}
exports.currencyEquals = currencyEquals;
