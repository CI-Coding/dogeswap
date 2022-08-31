import { ChainId } from "../constants";
import { BaseCurrency } from "./baseCurrency";
/**
 * Represents an ERC20 token with a unique address and some metadata.
 */
export declare class Token<T extends string = string> extends BaseCurrency<T> {
    readonly isNativeToken: false;
    readonly isToken: true;
    readonly chainId: ChainId;
    readonly address: string;
    constructor(chainId: ChainId, address: string, decimals: number, symbol: T, name?: string);
    /**
     * Returns true if the two tokens are equivalent, i.e. have the same chainId and address.
     * @param other other token to compare
     */
    equals(other: Token): boolean;
    /**
     * Returns true if the address of this token sorts before the address of the other token
     * @param other other token to compare
     * @throws if the tokens have the same address
     * @throws if the tokens are on different chains
     */
    sortsBefore(other: Token): boolean;
}
