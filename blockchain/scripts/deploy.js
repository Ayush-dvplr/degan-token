// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const DeganToken = await hre.ethers.getContractFactory("DeganToken");
  const deganToken = await DeganToken.deploy();

  await deganToken.deployed();
  console.log(`Contract deployed to ${deganToken.address}`);

  // Event listeners (for demonstration purposes)
  deganToken.on("Minted", (to, amount) => {
    console.log(`Minted ${amount} tokens to ${to}`);
  });

  deganToken.on("Burned", (from, amount) => {
    console.log(`Burned ${amount} tokens from ${from}`);
  });

  deganToken.on("StoreAddressSet", (storeAddress) => {
    console.log(`Store address set to ${storeAddress}`);
  });

  deganToken.on("RedemptionCodeGenerated", (code, amount) => {
    console.log(`Generated redemption code ${code} with ${amount} tokens`);
  });

  deganToken.on("Redeemed", (from, to, amount, code) => {
    console.log(
      `Redeemed ${amount} tokens from ${from} to ${to} using code ${code}`
    );
  });

  // Demonstration of minting some tokens (you can remove this in production)
  const [owner] = await hre.ethers.getSigners();
  await deganToken.mint(owner.address, hre.ethers.utils.parseUnits("1000", 18));
  console.log("Minted 1000 DGT tokens to the owner's address");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
