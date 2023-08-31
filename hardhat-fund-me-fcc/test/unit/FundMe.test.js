const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

describe("FundMe", function() {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    describe("constructor", async function() {
        it("Sets the aggregator addresses correctly", async function() {
            const response = await fundMe.priceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    describe("fund", async function() {
        it("Fail if you don't send enough ETH", async function() {
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("Updated the amount funded data structure", async function() {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.addressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async function() {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.funders(0)
            assert.equal(funder, deployer)
        })
    })

    describe("withdraw", async function() {
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraw ETH from a single founder", async function() {
            //Arrange
            const startingFundBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //Act
            const transactionResponse = await fundMe.withdraw()
            const trnsactionReciept = await transactionResponse.wait(1)

            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer.address
            )

            //Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })
    })
})
