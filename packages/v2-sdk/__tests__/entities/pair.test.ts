import { ChainId, CurrencyAmount, currencyEquals, Token } from "@dogeswap/sdk-core";
import { Pair } from "../../src/entities/pair";
import { InsufficientInputAmountError } from "../../src/errors";

const factoryAddress = "0x1111111111111111111111111111111111111111";

describe("Pair", () => {
    describe("miscellaneous", () => {
        it("getLiquidityMinted:0", async () => {
            const tokenA = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000001", 18, "");
            const tokenB = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000002", 18, "");
            const pair = new Pair(new CurrencyAmount(tokenA, "0"), new CurrencyAmount(tokenB, "0"), factoryAddress);

            expect(() => {
                pair.getLiquidityMinted(
                    new CurrencyAmount(pair.liquidityToken, "0"),
                    new CurrencyAmount(tokenA, "1000"),
                    new CurrencyAmount(tokenB, "1000"),
                );
            }).toThrow(InsufficientInputAmountError);

            expect(() => {
                pair.getLiquidityMinted(
                    new CurrencyAmount(pair.liquidityToken, "0"),
                    new CurrencyAmount(tokenA, "1000000"),
                    new CurrencyAmount(tokenB, "1"),
                );
            }).toThrow(InsufficientInputAmountError);

            const liquidity = pair.getLiquidityMinted(
                new CurrencyAmount(pair.liquidityToken, "0"),
                new CurrencyAmount(tokenA, "1001"),
                new CurrencyAmount(tokenB, "1001"),
            );

            expect(liquidity.raw.toString()).toEqual("1");
        });

        it("getLiquidityMinted:!0", async () => {
            const tokenA = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000001", 18, "");
            const tokenB = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000002", 18, "");
            const pair = new Pair(
                new CurrencyAmount(tokenA, "10000"),
                new CurrencyAmount(tokenB, "10000"),
                factoryAddress,
            );

            expect(
                pair
                    .getLiquidityMinted(
                        new CurrencyAmount(pair.liquidityToken, "10000"),
                        new CurrencyAmount(tokenA, "2000"),
                        new CurrencyAmount(tokenB, "2000"),
                    )
                    .raw.toString(),
            ).toEqual("2000");
        });

        it("getLiquidityValue:!feeOn", async () => {
            const tokenA = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000001", 18, "");
            const tokenB = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000002", 18, "");
            const pair = new Pair(
                new CurrencyAmount(tokenA, "1000"),
                new CurrencyAmount(tokenB, "1000"),
                factoryAddress,
            );

            {
                const liquidityValue = pair.getLiquidityValue(
                    tokenA,
                    new CurrencyAmount(pair.liquidityToken, "1000"),
                    new CurrencyAmount(pair.liquidityToken, "1000"),
                    false,
                );
                expect(currencyEquals(liquidityValue.currency, tokenA)).toBe(true);
                expect(liquidityValue.raw.toString()).toBe("1000");
            }

            // 500
            {
                const liquidityValue = pair.getLiquidityValue(
                    tokenA,
                    new CurrencyAmount(pair.liquidityToken, "1000"),
                    new CurrencyAmount(pair.liquidityToken, "500"),
                    false,
                );
                expect(currencyEquals(liquidityValue.currency, tokenA)).toBe(true);
                expect(liquidityValue.raw.toString()).toBe("500");
            }

            // tokenB
            {
                const liquidityValue = pair.getLiquidityValue(
                    tokenB,
                    new CurrencyAmount(pair.liquidityToken, "1000"),
                    new CurrencyAmount(pair.liquidityToken, "1000"),
                    false,
                );
                expect(currencyEquals(liquidityValue.currency, tokenB)).toBe(true);
                expect(liquidityValue.raw.toString()).toBe("1000");
            }
        });

        it("getLiquidityValue:feeOn", async () => {
            const tokenA = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000001", 18, "");
            const tokenB = new Token(ChainId.TESTNET, "0x0000000000000000000000000000000000000002", 18, "");
            const pair = new Pair(
                new CurrencyAmount(tokenA, "1000"),
                new CurrencyAmount(tokenB, "1000"),
                factoryAddress,
            );

            const liquidityValue = pair.getLiquidityValue(
                tokenA,
                new CurrencyAmount(pair.liquidityToken, "500"),
                new CurrencyAmount(pair.liquidityToken, "500"),
                true,
                "250000", // 500 ** 2
            );
            expect(currencyEquals(liquidityValue.currency, tokenA)).toBe(true);
            expect(liquidityValue.raw.toString()).toBe("917"); // ceiling(1000 - (500 * (1 / 6)))
        });
    });
});
