// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const RickdiculusStreams = await hre.ethers.getContractFactory(
    "RickdiculusStreams"
  );
  const rickdiculusStreams = await RickdiculusStreams.deploy(
    "0x200657E2f123761662567A1744f9ACAe50dF47E6",
    "0xEB796bdb90fFA0f28255275e16936D25d3418603"
  );

  await rickdiculusStreams.deployed();

  console.log("RickdiculusStreams deployed to:", rickdiculusStreams.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
