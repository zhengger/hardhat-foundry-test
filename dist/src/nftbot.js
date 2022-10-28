"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const HotBuyFactory__factory_1 = require("../typechain-types/factories/contracts/LIFEFORM/HotBuyFactory__factory");
const addresses_1 = require("./addresses");
async function main() {
    const provider = new ethers_1.providers.JsonRpcProvider("https://rpc.ankr.com/bsc");
    console.log("blockNumber", await provider.getBlockNumber());
    // const hotBuyFactory = new Contract(
    //     HOTBUY_FACTORY_ADDRESS,
    //     HotBuyFactory_abi,
    //     provider
    // ) as HotBuyFactory;
    const hotBuyFactory = HotBuyFactory__factory_1.HotBuyFactory__factory.connect(addresses_1.HOTBUY_FACTORY_ADDRESS, provider);
    const domain = await hotBuyFactory.DOMAIN_SEPARATOR();
    console.log("domain---", domain);
}
main().then().catch(console.error);
