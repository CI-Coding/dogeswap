"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pair = exports.computePairAddress = void 0;
const address_1 = require("@ethersproject/address");
const solidity_1 = require("@ethersproject/solidity");
const jsbi_1 = __importDefault(require("jsbi"));
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const sdk_core_1 = require("@dogeswap/sdk-core");
const constants_1 = require("../constants");
const errors_1 = require("../errors");
const computePairAddress = ({ factoryAddress, tokenA, tokenB, }) => {
    const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]; // does safety checks
    return (0, address_1.getCreate2Address)(factoryAddress, (0, solidity_1.keccak256)(["bytes"], [(0, solidity_1.pack)(["address", "address"], [token0.address, token1.address])]), constants_1.INIT_CODE_HASH);
};
exports.computePairAddress = computePairAddress;
class Pair {
    constructor(currencyAmountA, currencyAmountB, factoryAddress) {
        (0, tiny_invariant_1.default)(currencyAmountA.currency.isToken && currencyAmountB.currency.isToken, "TOKEN");
        const currencyAmounts = currencyAmountA.currency.sortsBefore(currencyAmountB.currency) // does safety checks
            ? [currencyAmountA, currencyAmountB]
            : [currencyAmountB, currencyAmountA];
        (0, tiny_invariant_1.default)(currencyAmounts[0].currency.isToken && currencyAmounts[1].currency.isToken, "TOKEN");
        this.liquidityToken = new sdk_core_1.Token(currencyAmounts[0].currency.chainId, Pair.getAddress(currencyAmounts[0].currency, currencyAmounts[1].currency, factoryAddress), 18, "DST-V2", "DogeSwap V2");
        this.currencyAmounts = currencyAmounts;
    }
    static getAddress(tokenA, tokenB, factoryAddress) {
        return (0, exports.computePairAddress)({ factoryAddress, tokenA, tokenB });
    }
    /**
     * Returns true if the token is either token0 or token1
     * @param token to check
     */
    involvesToken(token) {
        return token.equals(this.token0) || token.equals(this.token1);
    }
    /**
     * Returns the current mid price of the pair in terms of token0, i.e. the ratio of reserve1 to reserve0
     */
    get token0Price() {
        return new sdk_core_1.Price(this.token0, this.token1, this.currencyAmounts[0].raw, this.currencyAmounts[1].raw);
    }
    /**
     * Returns the current mid price of the pair in terms of token1, i.e. the ratio of reserve0 to reserve1
     */
    get token1Price() {
        return new sdk_core_1.Price(this.token1, this.token0, this.currencyAmounts[1].raw, this.currencyAmounts[0].raw);
    }
    /**
     * Return the price of the given token in terms of the other token in the pair.
     * @param token token to return price of
     */
    priceOf(token) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), "TOKEN");
        return token.equals(this.token0) ? this.token0Price : this.token1Price;
    }
    /**
     * Returns the chain ID of the tokens in the pair.
     */
    get chainId() {
        return this.token0.chainId;
    }
    get token0() {
        (0, tiny_invariant_1.default)(this.currencyAmounts[0].currency.isToken);
        return this.currencyAmounts[0].currency;
    }
    get token1() {
        (0, tiny_invariant_1.default)(this.currencyAmounts[1].currency.isToken);
        return this.currencyAmounts[1].currency;
    }
    get reserve0() {
        return this.currencyAmounts[0];
    }
    get reserve1() {
        return this.currencyAmounts[1];
    }
    reserveOf(token) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), "TOKEN");
        return token.equals(this.token0) ? this.reserve0 : this.reserve1;
    }
    getOutputAmount(inputAmount, factoryAddress) {
        (0, tiny_invariant_1.default)(inputAmount.currency.isToken && this.involvesToken(inputAmount.currency), "TOKEN");
        if (jsbi_1.default.equal(this.reserve0.raw, constants_1.ZERO) || jsbi_1.default.equal(this.reserve1.raw, constants_1.ZERO)) {
            throw new errors_1.InsufficientReservesError();
        }
        const inputReserve = this.reserveOf(inputAmount.currency);
        const outputReserve = this.reserveOf(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
        const inputAmountWithFee = jsbi_1.default.multiply(inputAmount.raw, constants_1._997);
        const numerator = jsbi_1.default.multiply(inputAmountWithFee, outputReserve.raw);
        const denominator = jsbi_1.default.add(jsbi_1.default.multiply(inputReserve.raw, constants_1._1000), inputAmountWithFee);
        const outputAmount = new sdk_core_1.CurrencyAmount(inputAmount.currency.equals(this.token0) ? this.token1 : this.token0, jsbi_1.default.divide(numerator, denominator));
        if (jsbi_1.default.equal(outputAmount.raw, constants_1.ZERO)) {
            throw new errors_1.InsufficientInputAmountError();
        }
        return [
            outputAmount,
            new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), factoryAddress),
        ];
    }
    getInputAmount(outputAmount, factoryAddress) {
        (0, tiny_invariant_1.default)(outputAmount.currency.isToken && this.involvesToken(outputAmount.currency), "TOKEN");
        if (jsbi_1.default.equal(this.reserve0.raw, constants_1.ZERO) ||
            jsbi_1.default.equal(this.reserve1.raw, constants_1.ZERO) ||
            jsbi_1.default.greaterThanOrEqual(outputAmount.raw, this.reserveOf(outputAmount.currency).raw)) {
            throw new errors_1.InsufficientReservesError();
        }
        const outputReserve = this.reserveOf(outputAmount.currency);
        const inputReserve = this.reserveOf(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0);
        const numerator = jsbi_1.default.multiply(jsbi_1.default.multiply(inputReserve.raw, outputAmount.raw), constants_1._1000);
        const denominator = jsbi_1.default.multiply(jsbi_1.default.subtract(outputReserve.raw, outputAmount.raw), constants_1._997);
        const inputAmount = new sdk_core_1.CurrencyAmount(outputAmount.currency.equals(this.token0) ? this.token1 : this.token0, jsbi_1.default.add(jsbi_1.default.divide(numerator, denominator), constants_1.ONE));
        return [
            inputAmount,
            new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount), factoryAddress),
        ];
    }
    getLiquidityMinted(totalSupply, currencyAmountA, currencyAmountB) {
        (0, tiny_invariant_1.default)(totalSupply.currency.isToken && totalSupply.currency.equals(this.liquidityToken), "LIQUIDITY");
        const currencyAmounts = currencyAmountA.currency.isToken &&
            currencyAmountB.currency.isToken &&
            currencyAmountA.currency.sortsBefore(currencyAmountB.currency) // does safety checks
            ? [currencyAmountA, currencyAmountB]
            : [currencyAmountB, currencyAmountA];
        (0, tiny_invariant_1.default)(currencyAmounts[0].currency.isToken && currencyAmounts[1].currency.isToken);
        (0, tiny_invariant_1.default)(currencyAmounts[0].currency.equals(this.token0) && currencyAmounts[1].currency.equals(this.token1), "TOKEN");
        let liquidity;
        if (jsbi_1.default.equal(totalSupply.raw, constants_1.ZERO)) {
            liquidity = jsbi_1.default.subtract((0, sdk_core_1.sqrt)(jsbi_1.default.multiply(currencyAmounts[0].raw, currencyAmounts[1].raw)), constants_1.MINIMUM_LIQUIDITY);
        }
        else {
            const amount0 = jsbi_1.default.divide(jsbi_1.default.multiply(currencyAmounts[0].raw, totalSupply.raw), this.reserve0.raw);
            const amount1 = jsbi_1.default.divide(jsbi_1.default.multiply(currencyAmounts[1].raw, totalSupply.raw), this.reserve1.raw);
            liquidity = jsbi_1.default.lessThanOrEqual(amount0, amount1) ? amount0 : amount1;
        }
        if (!jsbi_1.default.greaterThan(liquidity, constants_1.ZERO)) {
            throw new errors_1.InsufficientInputAmountError();
        }
        return new sdk_core_1.CurrencyAmount(this.liquidityToken, liquidity);
    }
    getLiquidityValue(token, totalSupply, liquidity, feeOn = false, kLast) {
        (0, tiny_invariant_1.default)(this.involvesToken(token), "TOKEN");
        (0, tiny_invariant_1.default)(totalSupply.currency.isToken && totalSupply.currency.equals(this.liquidityToken), "TOTAL_SUPPLY");
        (0, tiny_invariant_1.default)(liquidity.currency.isToken && liquidity.currency.equals(this.liquidityToken), "LIQUIDITY");
        (0, tiny_invariant_1.default)(jsbi_1.default.lessThanOrEqual(liquidity.raw, totalSupply.raw), "LIQUIDITY");
        let totalSupplyAdjusted;
        if (!feeOn) {
            totalSupplyAdjusted = totalSupply;
        }
        else {
            (0, tiny_invariant_1.default)(!!kLast, "K_LAST");
            const kLastParsed = jsbi_1.default.BigInt(kLast);
            if (!jsbi_1.default.equal(kLastParsed, constants_1.ZERO)) {
                const rootK = (0, sdk_core_1.sqrt)(jsbi_1.default.multiply(this.reserve0.raw, this.reserve1.raw));
                const rootKLast = (0, sdk_core_1.sqrt)(kLastParsed);
                if (jsbi_1.default.greaterThan(rootK, rootKLast)) {
                    const numerator = jsbi_1.default.multiply(totalSupply.raw, jsbi_1.default.subtract(rootK, rootKLast));
                    const denominator = jsbi_1.default.add(jsbi_1.default.multiply(rootK, constants_1.FIVE), rootKLast);
                    const feeLiquidity = jsbi_1.default.divide(numerator, denominator);
                    totalSupplyAdjusted = totalSupply.add(new sdk_core_1.CurrencyAmount(this.liquidityToken, feeLiquidity));
                }
                else {
                    totalSupplyAdjusted = totalSupply;
                }
            }
            else {
                totalSupplyAdjusted = totalSupply;
            }
        }
        return new sdk_core_1.CurrencyAmount(token, jsbi_1.default.divide(jsbi_1.default.multiply(liquidity.raw, this.reserveOf(token).raw), totalSupplyAdjusted.raw));
    }
}
exports.Pair = Pair;
