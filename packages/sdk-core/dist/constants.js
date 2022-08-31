"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxUint256 = exports.Rounding = exports.TradeType = exports.ChainId = void 0;
const jsbi_1 = __importDefault(require("jsbi"));
var ChainId;
(function (ChainId) {
    ChainId[ChainId["MAINNET"] = 117] = "MAINNET";
    ChainId[ChainId["TESTNET"] = 568] = "TESTNET";
    ChainId[ChainId["LOCALNET"] = 117] = "LOCALNET";
})(ChainId = exports.ChainId || (exports.ChainId = {}));
var TradeType;
(function (TradeType) {
    TradeType[TradeType["EXACT_INPUT"] = 0] = "EXACT_INPUT";
    TradeType[TradeType["EXACT_OUTPUT"] = 1] = "EXACT_OUTPUT";
})(TradeType = exports.TradeType || (exports.TradeType = {}));
var Rounding;
(function (Rounding) {
    Rounding[Rounding["ROUND_DOWN"] = 0] = "ROUND_DOWN";
    Rounding[Rounding["ROUND_HALF_UP"] = 1] = "ROUND_HALF_UP";
    Rounding[Rounding["ROUND_UP"] = 2] = "ROUND_UP";
})(Rounding = exports.Rounding || (exports.Rounding = {}));
exports.MaxUint256 = jsbi_1.default.BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
