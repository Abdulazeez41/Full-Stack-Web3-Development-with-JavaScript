const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { it } = require("node:test")

describe("FundMe", async function() {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function() {
        //deploy fundMe conract
        //using Hardhat-deploy
        //const accounts = ethers.getSigner()
        //const accountZero = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
    })
    describe("constructor", async function() {
        it("Sets the aggregator addresses correctly", async function() {
            const response = await fundMe.priceFeed()
            assert.expect(response, mockV3Aggregator.address)
        })
    })

    describe("FundMe", async function() {
        it("Fails if you don't spend enough ETH", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("Updated the amount funded data structure", async function() {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmount(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })
    })
})
