import { BaseCurrency } from "./baseCurrency";
import { Token } from "./token";
export declare class NativeToken extends BaseCurrency<"WDOGE"> {
    readonly isNativeToken: true;
    readonly isToken: false;
    /**
     * The only instance of the base class `Currency`.
     */
    static readonly Instance: NativeToken;
}
export declare type WrappedNativeToken = Token<"WWDOGE">;
