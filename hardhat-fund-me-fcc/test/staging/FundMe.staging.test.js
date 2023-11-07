const { deployments, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function() {
          // Declare variables to be used throughout the tests
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("1")

          // Before each test, set up the necessary contracts and accounts
          beforeEach(async function() {
              // Get the deployer account
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows users to fund and withdraw", async function() {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingBalance.toString(), "0")
          })
      })
