const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SimpleStorage", function () {
  let simpleStorage;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    
    const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
    simpleStorage = await SimpleStorage.deploy();
    await simpleStorage.waitForDeployment();
  });

  it("Should return the initial value as 0", async function () {
    expect(await simpleStorage.getValue()).to.equal(0);
  });

  it("Should set the value correctly", async function () {
    const tx = await simpleStorage.setValue(42);
    await tx.wait();
    
    expect(await simpleStorage.getValue()).to.equal(42);
  });

  it("Should emit an event when the value changes", async function () {
    await expect(simpleStorage.setValue(100))
      .to.emit(simpleStorage, "ValueChanged")
      .withArgs(owner.address, 0, 100);
  });
});
