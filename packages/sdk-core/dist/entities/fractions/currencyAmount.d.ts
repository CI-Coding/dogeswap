import JSBI from "jsbi";
import { Currency } from "../currency";
import { BigintIsh, Rounding } from "../../constants";
import Fraction from "./fraction";
export default class CurrencyAmount<T extends Currency = Currency> extends Fraction {
    readonly currency: T;
    /**
     * Helper that calls the constructor with the NativeToken.Instance currency
     * @param amount Dogechain amount in wei
     */
    static dogechain(amount: BigintIsh): CurrencyAmount;
    constructor(currency: T, amount: BigintIsh);
    get raw(): JSBI;
    add(other: CurrencyAmount): CurrencyAmount;
    subtract(other: CurrencyAmount): CurrencyAmount;
    toSignificant(significantDigits?: number, format?: object, rounding?: Rounding): string;
    toFixed(decimalPlaces?: number, format?: object, rounding?: Rounding): string;
    toExact(format?: object): string;
}
