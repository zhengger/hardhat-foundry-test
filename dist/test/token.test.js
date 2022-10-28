"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardhat_1 = require("hardhat");
describe("Token", function () {
    it("Should return name Token", async function () {
        const Token = await hardhat_1.ethers.getContractFactory("Token");
        const token = await Token.deploy();
        await token.deployed();
        (0, chai_1.expect)(await token.name()).to.equal("Token");
    });
});
