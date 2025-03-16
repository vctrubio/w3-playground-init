const { ethers } = require("hardhat");

async function main() {

  const HelloWorld = await ethers.getContractFactory("HelloWorld");
  const helloWorld = await HelloWorld.deploy();

  await helloWorld.waitForDeployment();
  
  const address = await helloWorld.getAddress();
  console.log(`HelloWorld deployed to: ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
