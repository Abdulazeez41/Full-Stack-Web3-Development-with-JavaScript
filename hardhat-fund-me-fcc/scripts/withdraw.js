const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    // Get the deployer account
    const { deployer } = (await getNamedAccounts()).deployer

    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding...")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("Withdrawn...")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
