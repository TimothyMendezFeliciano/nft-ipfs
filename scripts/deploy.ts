import { ethers } from "hardhat";

async function main() {
    const metadataURL = "ipfs://QmXmZC41KU1mcTXT7arCZ6VqEVWadLakpBNSjJZG6APKv3/";

    const BPTContract = await ethers.getContractFactory("Promises");
    const deployedBPTContract = await BPTContract.deploy(metadataURL);
    await deployedBPTContract.deployed();

    console.log("Promises Contract Address: ", deployedBPTContract.address);
}

main()
.then(() => process.exit(0))
.catch((error) => {
    console.error(error);
    process.exit(1);
})