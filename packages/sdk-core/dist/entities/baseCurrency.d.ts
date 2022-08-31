/**
 * A currency is any fungible financial instrument on Dogechain, including Dogechain and all ERC20 tokens.
 *
 * The only instance of the base class `Currency` is Dogechain.
 */
export declare abstract class BaseCurrency<T extends string = string> {
    abstract readonly isNativeToken: boolean;
    abstract readonly isToken: boolean;
    readonly decimals: number;
    readonly symbol: T;
    readonly name: string | undefined;
    /**
     * Constructs an instance of the base class `Currency`. The only instance of the base class `Currency` is `Currency.NativeToken.Instance`.
     * @param decimals decimals of the currency
     * @param symbol symbol of the currency
     * @param name of the currency
     */
    protected constructor(decimals: number, symbol: T, name?: string);
}
