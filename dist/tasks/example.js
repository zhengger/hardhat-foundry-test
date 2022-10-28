"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function example(params, hre) {
    const ethers = hre.ethers;
    const [account] = await ethers.getSigners();
    console.log(`Balance for 1st account ${await account.getAddress()}: ${await account.getBalance()}`);
}
exports.default = example;
