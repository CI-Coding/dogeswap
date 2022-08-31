"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_static_1 = __importDefault(require("koa-static"));
const path_1 = __importDefault(require("path"));
const yargs_1 = __importDefault(require("yargs"));
const run = async () => {
    const args = await (0, yargs_1.default)(process.argv.slice(2))
        .number(["p", "c"])
        .describe("p", "The port on which to run the server.")
        .describe("c", "The chain ID to set on the client")
        .demandOption(["c"])
        .default("p", 9001)
        .default("c", 31337)
        .parse();
    new koa_1.default()
        .use(async (ctx, next) => {
        ctx.cookies.set("chainId", args.c.toString(), { httpOnly: false });
        await next();
    })
        .use((0, koa_static_1.default)(path_1.default.resolve(__dirname, "..", "client")))
        .use((0, koa_static_1.default)(path_1.default.resolve(__dirname, "..", "client", "assets", "images")))
        .listen(args.p);
    console.log(`DogeSwap interface running. Port: ${args.p}. Chain ID: ${args.c}.`);
};
run();
