const ethers = require("ethers");

const provider = ethers.getDefaultProvider("ropsten");
const wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
console.log("Wallet:", wallet.address);

const address = "0xC5c38Dc1e7270DDB681BDbDc0D3c8043bf1Ac1b9";
const abi = [
    "event Registerd(bytes32 hash, string description, address signer)",
    "function registerOnBehalfOf(bytes32 hash, string description, address signer, uint8 v, bytes32 r, bytes32 s) public"
];
const contract = new ethers.Contract(address, abi, wallet);

let someHash = "0x0123456789012345678901234567890123456789012345678901234567890123";
let someDescr = "Hello World!";

(async function() {

    let payload = ethers.utils.defaultAbiCoder.encode([ "bytes32", "string" ], [ someHash, someDescr ]);
    console.log("Payload:", payload);

    let payloadHash = ethers.utils.keccak256(payload);
    console.log("PayloadHash:", payloadHash);

    // See the note in the Solidity; basically this would save 6 gas and
    // can potentially add security vulnerabilities in the future
    // let payloadHash = ethers.utils.solidityKeccak256([ "bytes32", "string" ], [ someHash, someDescr ]);

    // This adds the message prefix
    let signature = await wallet.signMessage(ethers.utils.arrayify(payloadHash));
    let sig = ethers.utils.splitSignature(signature);
    console.log("Signature:", sig);

    console.log("Recovered:", ethers.utils.verifyMessage(ethers.utils.arrayify(payloadHash), sig));

    let tx = await contract.registerOnBehalfOf(someHash, someDescr, wallet.address, sig.v, sig.r, sig.s);
    console.log("Transaction:", tx.hash);

    let receipt = await tx.wait();
    console.log("Receipt Status:", receipt.status);

    receipt.events.forEach((event) => {
        console.log("Event:", event.eventSignature, event.args);
    });

})().then(() => {
    console.log("done");
});
