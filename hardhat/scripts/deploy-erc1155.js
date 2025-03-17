const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying HouseUrban ERC1155 token...");
  
  const HouseUrban = await ethers.getContractFactory("HouseUrban");
  const houseUrban = await HouseUrban.deploy();
  
  await houseUrban.waitForDeployment();
  
  const address = await houseUrban.getAddress();
  console.log(`HouseUrban deployed to: ${address}`);
  
  console.log("Waiting for block confirmations...");
  // Wait for 5 block confirmations for Etherscan verification
  await houseUrban.deploymentTransaction().wait(5);
  
  // Verify the contract on Etherscan if API key is available
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract: ", error);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
