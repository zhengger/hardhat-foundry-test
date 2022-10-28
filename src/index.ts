import { BigNumber, providers, Signer, Wallet, utils } from "ethers";
import { HotBuyFactory__factory } from "../typechain-types/factories/contracts/LIFEFORM/HotBuyFactory__factory";
import { LifeformBoundToken__factory } from "../typechain-types/factories/contracts/LIFEFORM/LifeformBoundToken.sol/LifeformBoundToken__factory";
import {
    COST_ERC20_BUSD_ADDRESS,
    HOTBUY_FACTORY_ADDRESS,
    LBT_ADDRESS,
    NFT_CONTRACT_1155_ADDRESS,
} from "./addresses";
import { config as dotenvConfig } from "dotenv";
import { HotBuyFactory } from "../typechain-types/contracts/LIFEFORM/HotBuyFactory";
import { TypedDataUtils } from "ethers-eip712";
dotenvConfig();

async function main() {
    const provider = new providers.JsonRpcProvider(
        // "https://bsc-dataseed4.ninicoin.io/"
        "https://bscrpc.com"
    );
    console.log("process.env.PRK--", process.env.PRK);
    const signer = new Wallet(process.env.PRK as string).connect(provider);
    console.log("blockNumber", await provider.getBlockNumber());
    const hotBuyFactory = HotBuyFactory__factory.connect(
        HOTBUY_FACTORY_ADDRESS,
        signer
    );
    const LBT_Factory = LifeformBoundToken__factory.connect(
        LBT_ADDRESS,
        signer
    );

    const domain_separator = await hotBuyFactory.DOMAIN_SEPARATOR();
    const type_hash = await hotBuyFactory.TYPE_HASH();
    console.log("domain---", domain_separator, "type_hash---", type_hash);
    /* 
        ercType	uint64	1155
        mintCount	uint256	1
        condition.price	uint256	10000000000000000
        condition.startTime	uint256	0
        condition.endTime	uint256	999999999999999
        condition.limitCount	uint256	999999
        condition.maxSoldAmount	uint256	10
        condition.signCode	bytes32	0xc426002b75b7167286c5c6a6490d6bc0c99430cb1d14ecd012c197653836e3de
        condition.tokenId	uint256	10110300042
        condition.stage	uint256	1
        condition.nftContract	address	0x7eD215D8e731eC06fE387Ddb2a8880e7D8dF6b4d
        condition.costErc20	address	0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56
        condition.wlSignature	bytes	0x
        dataSignature	bytes	0x014ac060ee122ec6ca38de2656f64f3051885625af2af63df69343e0444a3c0777f70bc69c4f822d7c249cbb6c11fdc3698094768e10fabcaa2ced86fe0c2c8f1c
 */
    let condition: HotBuyFactory.ConditionStruct = {
        price: utils.parseEther("10000000000000000"),
        startTime: 0,
        endTime: 999999999999999,
        limitCount: 999999,
        maxSoldAmount: 10,
        signCode:
            "0x287bd0aeded5037438cedcec4e2c90a64f431c6202f3390222648fe00067a51c",
        tokenId: 10110300042,
        stage: 1,
        nftContract: NFT_CONTRACT_1155_ADDRESS,
        costErc20: COST_ERC20_BUSD_ADDRESS,
        wlSignature: "0x",
    };
    // condition
    let v = BigNumber.from("0");
    let r = "0x00";
    let s = "0x00";

    // hashDigest
    const abiCoder = new utils.AbiCoder();

    const hashCondition = utils.keccak256(
        abiCoder.encode(
            [
                "bytes32",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "uint256",
                "bytes32",
                "uint256",
                "uint256",
                "address",
                "address",
                "bytes32",
            ],
            [
                type_hash,
                condition.price,
                condition.startTime,
                condition.endTime,
                condition.limitCount,
                condition.maxSoldAmount,
                condition.signCode,
                condition.tokenId,
                condition.stage,
                condition.nftContract,
                condition.costErc20,
                utils.keccak256("0x"),
            ]
        )
    );
    const hashCondition_onChain = await hotBuyFactory.hashCondition(condition);
    console.log(
        "hashCondition---",
        hashCondition,
        "hashCondition_onChain----",
        hashCondition_onChain,
        "equal------",
        hashCondition_onChain == hashCondition
    );

    const hashDigest = utils.keccak256(
        utils.solidityPack(
            ["string", "bytes32", "bytes32"],
            ["\x19\x01", domain_separator, hashCondition]
        )
    );
    // const message = abiCoder.encode(
    //     [
    //         "bytes32",
    //         "uint256",
    //         "uint256",
    //         "uint256",
    //         "uint256",
    //         "uint256",
    //         "bytes32",
    //         "uint256",
    //         "uint256",
    //         "address",
    //         "address",
    //         "bytes32",
    //     ],
    //     [
    //         type_hash,
    //         condition.price,
    //         condition.startTime,
    //         condition.endTime,
    //         condition.limitCount,
    //         condition.maxSoldAmount,
    //         condition.signCode,
    //         condition.tokenId,
    //         condition.stage,
    //         condition.nftContract,
    //         condition.costErc20,
    //         utils.keccak256("0x"),
    //     ]
    // );
    const message = utils.solidityPack(
        ["string", "bytes32", "bytes32"],
        ["\x19\x01", domain_separator, hashCondition]
    );
    const hashDigest_onChain = await hotBuyFactory.hashDigest(condition);
    console.log(
        "hashDigest---",
        hashDigest,
        "hashDigest_onChain----",
        hashDigest_onChain
    );
    // [X] verify
    const signedCondition = await signer.signMessage(message);
    const addressRevodered = utils.verifyMessage(message, signedCondition);
    console.log("addressRevodered---", addressRevodered);
    let signatureCondition = utils.splitSignature(signedCondition);
    const verifyCondition = await hotBuyFactory.verifyCondition(
        condition,
        signatureCondition.v,
        signatureCondition.r,
        signatureCondition.s
    );
    console.log(
        "verifyCondition----",
        verifyCondition,
        "wallet----",
        signer.address
    );

    // eip712
    const EIP712DOMAIN_TYPEHASH = await hotBuyFactory.EIP712DOMAIN_TYPEHASH();
    const TYPE_HASH = await hotBuyFactory.TYPE_HASH();

    const typedData = {};

    const domain = {
        name: "",
    };
    const value = {
        from: {
            name: "Cow",
            wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
        },
        to: {
            name: "Bob",
            wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
        },
        contents: "Hello, Bob!",
    };

    const types = {
        Person: [
            { name: "name", type: "string" },
            { name: "wallet", type: "address" },
        ],
        Mail: [
            { name: "from", type: "Person" },
            { name: "to", type: "Person" },
            { name: "contents", type: "string" },
        ],
    };

    const domainHash = utils._TypedDataEncoder.encode(domain, types, value);
}
main()
    .then()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
