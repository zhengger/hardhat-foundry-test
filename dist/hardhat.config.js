"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
require("@nomiclabs/hardhat-waffle");
require("@typechain/hardhat");
require("hardhat-preprocessor");
const config_1 = require("hardhat/config");
const example_1 = __importDefault(require("./tasksSS/example"));
function getRemappings() {
    return fs_1.default
        .readFileSync("remappings.txt", "utf8")
        .split("\n")
        .filter(Boolean)
        .map((line) => line.trim().split("="));
}
(0, config_1.task)("example", "Example task").setAction(example_1.default);
const config = {
    solidity: {
        compilers: [
            {
                version: "0.8.17",
            },
            // {
            //     version: "0.8.13",
            //     settings: {
            //         optimizer: {
            //             enabled: true,
            //             runs: 200,
            //         },
            //     },
            // },
        ],
    },
    paths: {
        // sources: "./src", // Use ./src rather than ./contracts as Hardhat expects
        artifacts: "./artifacts",
        sources: "./contracts",
        tests: "./test",
        cache: "./cache_hardhat", // Use a different cache for Hardhat than Foundry
    },
    // This fully resolves paths for imports in the ./lib directory for Hardhat
    preprocess: {
        eachLine: (hre) => ({
            transform: (line) => {
                if (line.match(/^\s*import /i)) {
                    getRemappings().forEach(([find, replace]) => {
                        if (line.match(find)) {
                            line = line.replace(find, replace);
                        }
                    });
                }
                return line;
            },
        }),
    },
};
exports.default = config;
