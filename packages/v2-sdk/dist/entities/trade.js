"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = exports.tradeComparator = exports.inputOutputComparator = void 0;
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const constants_1 = require("../constants");
const sdk_core_1 = require("@dogeswap/sdk-core");
const route_1 = require("./route");
/**
 * Returns the percent difference between the mid price and the execution price, i.e. price impact.
 * @param midPrice mid price before the trade
 * @param inputAmount the input amount of the trade
 * @param outputAmount the output amount of the trade
 */
function computePriceImpact(midPrice, inputAmount, outputAmount) {
    const exactQuote = midPrice.raw.multiply(inputAmount.raw);
    // calculate slippage := (exactQuote - outputAmount) / exactQuote
    const slippage = exactQuote.subtract(outputAmount.raw).divide(exactQuote);
    return new sdk_core_1.Percent(slippage.numerator, slippage.denominator);
}
// comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first
function inputOutputComparator(a, b) {
    // must have same input and output token for comparison
    (0, tiny_invariant_1.default)((0, sdk_core_1.currencyEquals)(a.inputAmount.currency, b.inputAmount.currency), "INPUT_CURRENCY");
    (0, tiny_invariant_1.default)((0, sdk_core_1.currencyEquals)(a.outputAmount.currency, b.outputAmount.currency), "OUTPUT_CURRENCY");
    if (a.outputAmount.equalTo(b.outputAmount)) {
        if (a.inputAmount.equalTo(b.inputAmount)) {
            return 0;
        }
        // trade A requires less input than trade B, so A should come first
        if (a.inputAmount.lessThan(b.inputAmount)) {
            return -1;
        }
        else {
            return 1;
        }
    }
    else {
        // tradeA has less output than trade B, so should come second
        if (a.outputAmount.lessThan(b.outputAmount)) {
            return 1;
        }
        else {
            return -1;
        }
    }
}
exports.inputOutputComparator = inputOutputComparator;
// extension of the input output comparator that also considers other dimensions of the trade in ranking them
function tradeComparator(a, b) {
    const ioComp = inputOutputComparator(a, b);
    if (ioComp !== 0) {
        return ioComp;
    }
    // consider lowest slippage next, since these are less likely to fail
    if (a.priceImpact.lessThan(b.priceImpact)) {
        return -1;
    }
    else if (a.priceImpact.greaterThan(b.priceImpact)) {
        return 1;
    }
    // finally consider the number of hops since each hop costs gas
    return a.route.path.length - b.route.path.length;
}
exports.tradeComparator = tradeComparator;
/**
 * Given a currency amount and a chain ID, returns the equivalent representation as the token amount.
 * In other words, if the currency is NativeToken.Instance, returns the WWDOGE token amount for the given chain. Otherwise, returns
 * the input currency amount.
 */
function wrappedAmount(currencyAmount, wwdoge) {
    if (currencyAmount.currency.isToken)
        return currencyAmount;
    if (currencyAmount.currency.isNativeToken)
        return new sdk_core_1.CurrencyAmount(wwdoge, currencyAmount.raw);
    throw new Error("CURRENCY");
}
function wrappedCurrency(currency, wwdoge) {
    if (currency.isToken)
        return currency;
    if (currency === sdk_core_1.NativeToken.Instance)
        return wwdoge;
    throw new Error("CURRENCY");
}
/**
 * Represents a trade executed against a list of pairs.
 * Does not account for slippage, i.e. trades that front run this trade and move the price.
 */
class Trade {
    constructor(route, amount, tradeType, wrapped, factoryAddress) {
        const amounts = new Array(route.path.length);
        const nextPairs = new Array(route.pairs.length);
        if (tradeType === sdk_core_1.TradeType.EXACT_INPUT) {
            (0, tiny_invariant_1.default)((0, sdk_core_1.currencyEquals)(amount.currency, route.input), "INPUT");
            amounts[0] = wrappedAmount(amount, wrapped);
            for (let i = 0; i < route.path.length - 1; i++) {
                const pair = route.pairs[i];
                const [outputAmount, nextPair] = pair.getOutputAmount(amounts[i], factoryAddress);
                amounts[i + 1] = outputAmount;
                nextPairs[i] = nextPair;
            }
        }
        else {
            (0, tiny_invariant_1.default)((0, sdk_core_1.currencyEquals)(amount.currency, route.output), "OUTPUT");
            amounts[amounts.length - 1] = wrappedAmount(amount, wrapped);
            for (let i = route.path.length - 1; i > 0; i--) {
                const pair = route.pairs[i - 1];
                const [inputAmount, nextPair] = pair.getInputAmount(amounts[i], factoryAddress);
                amounts[i - 1] = inputAmount;
                nextPairs[i - 1] = nextPair;
            }
        }
        this.route = route;
        this.tradeType = tradeType;
        this.inputAmount =
            tradeType === sdk_core_1.TradeType.EXACT_INPUT
                ? amount
                : route.input === sdk_core_1.NativeToken.Instance
                    ? sdk_core_1.CurrencyAmount.dogechain(amounts[0].raw)
                    : amounts[0];
        this.outputAmount =
            tradeType === sdk_core_1.TradeType.EXACT_OUTPUT
                ? amount
                : route.output === sdk_core_1.NativeToken.Instance
                    ? sdk_core_1.CurrencyAmount.dogechain(amounts[amounts.length - 1].raw)
                    : amounts[amounts.length - 1];
        this.executionPrice = new sdk_core_1.Price(this.inputAmount.currency, this.outputAmount.currency, this.inputAmount.raw, this.outputAmount.raw);
        this.nextMidPrice = new route_1.Route(nextPairs, wrapped, route.input).midPrice;
        this.priceImpact = computePriceImpact(route.midPrice, this.inputAmount, this.outputAmount);
    }
    /**
     * Constructs an exact in trade with the given amount in and route
     * @param route route of the exact in trade
     * @param amountIn the amount being passed in
     */
    static exactIn(route, amountIn, wrapped, factoryAddress) {
        return new Trade(route, amountIn, sdk_core_1.TradeType.EXACT_INPUT, wrapped, factoryAddress);
    }
    /**
     * Constructs an exact out trade with the given amount out and route
     * @param route route of the exact out trade
     * @param amountOut the amount returned by the trade
     */
    static exactOut(route, amountOut, wrapped, factoryAddress) {
        return new Trade(route, amountOut, sdk_core_1.TradeType.EXACT_OUTPUT, wrapped, factoryAddress);
    }
    /**
     * Get the minimum amount that must be received from this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    minimumAmountOut(slippageTolerance) {
        (0, tiny_invariant_1.default)(!slippageTolerance.lessThan(constants_1.ZERO), "SLIPPAGE_TOLERANCE");
        if (this.tradeType === sdk_core_1.TradeType.EXACT_OUTPUT) {
            return this.outputAmount;
        }
        else {
            const slippageAdjustedAmountOut = new sdk_core_1.Fraction(constants_1.ONE)
                .add(slippageTolerance)
                .invert()
                .multiply(this.outputAmount.raw).quotient;
            return new sdk_core_1.CurrencyAmount(this.outputAmount.currency, slippageAdjustedAmountOut);
        }
    }
    /**
     * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
     * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
     */
    maximumAmountIn(slippageTolerance) {
        (0, tiny_invariant_1.default)(!slippageTolerance.lessThan(constants_1.ZERO), "SLIPPAGE_TOLERANCE");
        if (this.tradeType === sdk_core_1.TradeType.EXACT_INPUT) {
            return this.inputAmount;
        }
        else {
            const slippageAdjustedAmountIn = new sdk_core_1.Fraction(constants_1.ONE)
                .add(slippageTolerance)
                .multiply(this.inputAmount.raw).quotient;
            return new sdk_core_1.CurrencyAmount(this.inputAmount.currency, slippageAdjustedAmountIn);
        }
    }
    /**
     * Given a list of pairs, and a fixed amount in, returns the top `maxNumResults` trades that go from an input token
     * amount to an output token, making at most `maxHops` hops.
     * Note this does not consider aggregation, as routes are linear. It's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyAmountIn exact amount of input currency to spend
     * @param currencyOut the desired currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param originalAmountIn used in recursion; the original value of the currencyAmountIn parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactIn(pairs, currencyAmountIn, currencyOut, wrapped, factoryAddress, { maxNumResults = 3, maxHops = 3 } = {}, 
    // used in recursion.
    currentPairs = [], originalAmountIn = currencyAmountIn, bestTrades = []) {
        (0, tiny_invariant_1.default)(pairs.length > 0, "PAIRS");
        (0, tiny_invariant_1.default)(maxHops > 0, "MAX_HOPS");
        (0, tiny_invariant_1.default)(originalAmountIn === currencyAmountIn || currentPairs.length > 0, "INVALID_RECURSION");
        const chainId = currencyAmountIn.currency.isToken
            ? currencyAmountIn.currency.chainId
            : currencyOut.isToken
                ? currencyOut.chainId
                : undefined;
        (0, tiny_invariant_1.default)(chainId !== undefined, "CHAIN_ID");
        const amountIn = wrappedAmount(currencyAmountIn, wrapped);
        const tokenOut = wrappedCurrency(currencyOut, wrapped);
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            // pair irrelevant
            if (!(0, sdk_core_1.currencyEquals)(pair.token0, amountIn.currency) && !(0, sdk_core_1.currencyEquals)(pair.token1, amountIn.currency))
                continue;
            if (pair.reserve0.equalTo(constants_1.ZERO) || pair.reserve1.equalTo(constants_1.ZERO))
                continue;
            let amountOut;
            try {
                [amountOut] = pair.getOutputAmount(amountIn, factoryAddress);
            }
            catch (error) {
                // input too low
                if (error.isInsufficientInputAmountError) {
                    continue;
                }
                throw error;
            }
            // we have arrived at the output token, so this is the final trade of one of the paths
            if ((0, sdk_core_1.currencyEquals)(amountOut.currency, tokenOut)) {
                (0, sdk_core_1.sortedInsert)(bestTrades, new Trade(new route_1.Route([...currentPairs, pair], wrapped, originalAmountIn.currency, currencyOut), originalAmountIn, sdk_core_1.TradeType.EXACT_INPUT, wrapped, factoryAddress), maxNumResults, tradeComparator);
            }
            else if (maxHops > 1 && pairs.length > 1) {
                const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
                // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
                Trade.bestTradeExactIn(pairsExcludingThisPair, amountOut, currencyOut, wrapped, factoryAddress, {
                    maxNumResults,
                    maxHops: maxHops - 1,
                }, [...currentPairs, pair], originalAmountIn, bestTrades);
            }
        }
        return bestTrades;
    }
    /**
     * Return the execution price after accounting for slippage tolerance
     * @param slippageTolerance the allowed tolerated slippage
     */
    worstExecutionPrice(slippageTolerance) {
        return new sdk_core_1.Price(this.inputAmount.currency, this.outputAmount.currency, this.maximumAmountIn(slippageTolerance).raw, this.minimumAmountOut(slippageTolerance).raw);
    }
    /**
     * similar to the above method but instead targets a fixed output amount
     * given a list of pairs, and a fixed amount out, returns the top `maxNumResults` trades that go from an input token
     * to an output token amount, making at most `maxHops` hops
     * note this does not consider aggregation, as routes are linear. it's possible a better route exists by splitting
     * the amount in among multiple routes.
     * @param pairs the pairs to consider in finding the best trade
     * @param currencyIn the currency to spend
     * @param currencyAmountOut the exact amount of currency out
     * @param maxNumResults maximum number of results to return
     * @param maxHops maximum number of hops a returned trade can make, e.g. 1 hop goes through a single pair
     * @param currentPairs used in recursion; the current list of pairs
     * @param originalAmountOut used in recursion; the original value of the currencyAmountOut parameter
     * @param bestTrades used in recursion; the current list of best trades
     */
    static bestTradeExactOut(pairs, currencyIn, currencyAmountOut, wrapped, factoryAddress, { maxNumResults = 3, maxHops = 3 } = {}, 
    // used in recursion.
    currentPairs = [], originalAmountOut = currencyAmountOut, bestTrades = []) {
        (0, tiny_invariant_1.default)(pairs.length > 0, "PAIRS");
        (0, tiny_invariant_1.default)(maxHops > 0, "MAX_HOPS");
        (0, tiny_invariant_1.default)(originalAmountOut === currencyAmountOut || currentPairs.length > 0, "INVALID_RECURSION");
        const chainId = currencyAmountOut.currency.isToken
            ? currencyAmountOut.currency.chainId
            : currencyIn.isToken
                ? currencyIn.chainId
                : undefined;
        (0, tiny_invariant_1.default)(chainId !== undefined, "CHAIN_ID");
        const amountOut = wrappedAmount(currencyAmountOut, wrapped);
        const tokenIn = wrappedCurrency(currencyIn, wrapped);
        for (let i = 0; i < pairs.length; i++) {
            const pair = pairs[i];
            // pair irrelevant
            if (!(0, sdk_core_1.currencyEquals)(pair.token0, amountOut.currency) && !(0, sdk_core_1.currencyEquals)(pair.token1, amountOut.currency))
                continue;
            if (pair.reserve0.equalTo(constants_1.ZERO) || pair.reserve1.equalTo(constants_1.ZERO))
                continue;
            let amountIn;
            try {
                [amountIn] = pair.getInputAmount(amountOut, factoryAddress);
            }
            catch (error) {
                // not enough liquidity in this pair
                if (error.isInsufficientReservesError) {
                    continue;
                }
                throw error;
            }
            // we have arrived at the input token, so this is the first trade of one of the paths
            if ((0, sdk_core_1.currencyEquals)(amountIn.currency, tokenIn)) {
                (0, sdk_core_1.sortedInsert)(bestTrades, new Trade(new route_1.Route([pair, ...currentPairs], wrapped, currencyIn, originalAmountOut.currency), originalAmountOut, sdk_core_1.TradeType.EXACT_OUTPUT, wrapped, factoryAddress), maxNumResults, tradeComparator);
            }
            else if (maxHops > 1 && pairs.length > 1) {
                const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length));
                // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops
                Trade.bestTradeExactOut(pairsExcludingThisPair, currencyIn, amountIn, wrapped, factoryAddress, {
                    maxNumResults,
                    maxHops: maxHops - 1,
                }, [pair, ...currentPairs], originalAmountOut, bestTrades);
            }
        }
        return bestTrades;
    }
}
exports.Trade = Trade;
