"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._1000 = exports._997 = exports.FIVE = exports.ONE = exports.ZERO = exports.MINIMUM_LIQUIDITY = exports.INIT_CODE_HASH = void 0;
const jsbi_1 = __importDefault(require("jsbi"));
// Must match the value in DogeSwapV2Library.sol
exports.INIT_CODE_HASH = "0xbfc2d4e06b5c176871b6144c7de089666b9ec72c1d8ba86002bfc8ea119b2419";
exports.MINIMUM_LIQUIDITY = jsbi_1.default.BigInt(1000);
// exports for internal consumption
exports.ZERO = jsbi_1.default.BigInt(0);
exports.ONE = jsbi_1.default.BigInt(1);
exports.FIVE = jsbi_1.default.BigInt(5);
exports._997 = jsbi_1.default.BigInt(997);
exports._1000 = jsbi_1.default.BigInt(1000);
