"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("@ethersproject/address");
/**
 * Validates an address and returns the parsed (checksummed) version of that address
 * @param address the unchecksummed hex address
 */
function validateAndParseAddress(address) {
    try {
        return (0, address_1.getAddress)(address);
    }
    catch (error) {
        throw new Error(`${address} is not a valid address.`);
    }
}
exports.default = validateAndParseAddress;
