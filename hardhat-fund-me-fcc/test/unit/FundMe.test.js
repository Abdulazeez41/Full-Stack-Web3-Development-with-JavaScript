// Importing necessary modules from Hardhat and Chai for testing
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")

// Main test suite for the FundMe smart contract
describe("FundMe", function() {
    // Declare variables to be used throughout the tests
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("1")

    // Before each test, set up the necessary contracts and accounts
    beforeEach(async function() {
        // Get the deployer account
        deployer = (await getNamedAccounts()).deployer

        // Print named accounts for debugging purposes
        // console.log(await getNamedAccounts())

        // Deploy contracts using the fixture and get instances
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })

    // Test the constructor of the FundMe contract
    describe("constructor", async function() {
        it("Sets the aggregator addresses correctly", async function() {
            // Check if the aggregator address is set correctly
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    })

    // Test the fund function of the FundMe contract
    describe("fund", async function() {
        it("Fails if you don't send enough ETH", async function() {
            // Expect the fund function to revert if insufficient ETH is sent
            await expect(fundMe.fund()).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })

        it("Updates the amount funded data structure", async function() {
            // Fund the contract and check if the amount funded is updated
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async function() {
            // Fund the contract and check if the funder is added to the array
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    })

    // Test the withdraw function of the FundMe contract
    describe("withdraw", async function() {
        // Before each test in this section, fund the contract
        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        // Test withdrawing ETH from a single funder
        it("Withdraws ETH from a single funder", async function() {
            // Arrange: Get initial balances and gas cost
            const startingFundBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act: Withdraw and get transaction details
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // Extract gas cost and calculate ending balances
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert: Check if balances and gas cost are as expected
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        // Test withdrawing ETH with multiple funders
        it("Allows us to withdraw with multiple funders", async function() {
            // Arrange: Fund the contract with multiple accounts
            const accounts = await ethers.getSigners()
            for (let i = 0; i < 6; i++) {
                const fundMeConnectedContract = await fundMe.connect(
                    accounts[i]
                )
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            // Get initial balances and gas cost
            const startingFundBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Act: Withdraw and get transaction details
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // Extract gas cost and calculate ending balances
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            // Assert: Check if balances, gas cost, and funder arrays are as expected
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            // Check if the funders array is reset properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            // Check if the amount funded by each funder is reset to 0
            for (let i = 0; i < 6; i++) {
                await assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        // Test the withdraw function to ensure only the owner can withdraw
        it("Only allows the owner to withdraw", async function() {
            // Get the list of accounts and select one as an attacker
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]

            // Connect the attacker to the FundMe contract
            const attackerConnectedContract = await fundMe.connect(attacker)

            // Expect the withdraw function to revert when called by the attacker
            await expect(
                attackerConnectedContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
    })
    // Test withdrawing ETH with multiple getFunder
    it("cheaperWithdraw testing...", async function() {
        // Arrange: Fund the contract with multiple accounts
        const accounts = await ethers.getSigners()
        for (let i = 0; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
        }

        // Get initial balances and gas cost
        const startingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
        )

        // Act: Withdraw and get transaction details
        const transactionResponse = await fundMe.cheaperWithdraw()
        const transactionReceipt = await transactionResponse.wait(1)

        // Extract gas cost and calculate ending balances
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

        // Assert: Check if balances, gas cost, and funder arrays are as expected
        assert.equal(endingFundMeBalance, 0)
        assert.equal(
            startingFundBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
        )

        // Check if the getFunder array is reset properly
        await expect(fundMe.getFunder(0)).to.be.reverted

        // Check if the amount funded by each funder is reset to 0
        for (let i = 0; i < 6; i++) {
            await assert.equal(
                await fundMe.getAddressToAmountFunded(accounts[i].address),
                0
            )
        }
    })

    // Test withdrawing ETH from a single funder
    it("Withdraws ETH from a single funder", async function() {
        // Arrange: Get initial balances and gas cost
        const startingFundBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
        )

        // Act: Withdraw and get transaction details
        const transactionResponse = await fundMe.cheaperWithdraw()
        const transactionReceipt = await transactionResponse.wait(1)

        // Extract gas cost and calculate ending balances
        const { gasUsed, effectiveGasPrice } = transactionReceipt
        const gasCost = gasUsed.mul(effectiveGasPrice)
        const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
        )
        const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

        // Assert: Check if balances and gas cost are as expected
        assert.equal(endingFundMeBalance, 0)
        assert.equal(
            startingFundBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
        )
    })
})
