"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Route = void 0;
const sdk_core_1 = require("@dogeswap/sdk-core");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
class Route {
    constructor(pairs, wrapped, input, output) {
        (0, tiny_invariant_1.default)(pairs.length > 0, "PAIRS");
        const chainId = pairs[0].chainId;
        (0, tiny_invariant_1.default)(pairs.every((pair) => pair.chainId === chainId), "CHAIN_IDS");
        (0, tiny_invariant_1.default)((input.isToken && pairs[0].involvesToken(input)) ||
            (input === sdk_core_1.NativeToken.Instance && pairs[0].involvesToken(wrapped)), "INPUT");
        (0, tiny_invariant_1.default)(typeof output === "undefined" ||
            (output.isToken && pairs[pairs.length - 1].involvesToken(output)) ||
            (output === sdk_core_1.NativeToken.Instance && wrapped && pairs[pairs.length - 1].involvesToken(wrapped)), "OUTPUT");
        const path = [input.isToken ? input : wrapped];
        for (const [i, pair] of pairs.entries()) {
            const currentInput = path[i];
            (0, tiny_invariant_1.default)(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), "PATH");
            const output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0;
            path.push(output);
        }
        this.pairs = pairs;
        this.path = path;
        this.input = input;
        this.output = output ?? path[path.length - 1];
    }
    get midPrice() {
        const prices = [];
        for (const [i, pair] of this.pairs.entries()) {
            prices.push(this.path[i].equals(pair.token0)
                ? new sdk_core_1.Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.raw, pair.reserve1.raw)
                : new sdk_core_1.Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.raw, pair.reserve0.raw));
        }
        return prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0]);
    }
    get chainId() {
        return this.pairs[0].chainId;
    }
}
exports.Route = Route;
