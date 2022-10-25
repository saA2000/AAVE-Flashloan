const { expect, assert } = require("chai");
const { BigNumber } = require("ethers");
const { ethers, waffle, artifacts } = require("hardhat");
const hre = require("hardhat");

const { DAI, POOL_ADDRESS_PROVIDER, DAI_HOLDER } = require("../config");

describe("Initiate a Flashloan", () => {
    it("Should receive a flashloan and repay it correctly", async () => {
        const flashloanExample = await ethers.getContractFactory("Flashloan");

        const _flashloanExample = await flashloanExample.deploy(POOL_ADDRESS_PROVIDER);

        await _flashloanExample.deployed();

        const token = await ethers.getContractAt("IERC20", DAI);
        const DAI_BALANCE = ethers.utils.parseEther("2000");

        // Impersonate an address that holds DAI on Polygon mainnet, send some DAI to flashloanExample contract
        await hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [DAI_HOLDER],
        });

        // Send some DAI to flashloan contract to repay the flashloan premium
        const signer = await ethers.getSigner(DAI_HOLDER);
        await token.connect(signer).transfer(_flashloanExample.address, DAI_BALANCE); 

        // Try to execute flashloan
        const tx = await _flashloanExample.createFlashloan(DAI, 1000);
        await tx.wait();
        const remainingBalance = await token.balanceOf(_flashloanExample.address);
        expect(remainingBalance.lt(DAI_BALANCE)).to.be.true;
    });
});