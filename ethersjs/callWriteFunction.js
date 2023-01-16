const { ethers } = require("ethers");
const ABI = require("./ABI");

const callWriteFunction = async () => {
  // Create a provider instance
  const provider = new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/INFURA-KEY"
  );

  // Create a wallet instance
  const wallet = new ethers.Wallet("PRIVATE-KEY-HERE", provider);

  // Create the contract instance and connect it to our wallet
  const contract = new ethers.Contract(
    "DEPLOYED-CONTRACT-ADDRESS-HERE",
    ABI.humanReadableABI,
    wallet
  );

  // Get ERC20 token symbol
  const symbol = await contract.symbol();

  // Call mint function from smart contract and mint 10 MOCK token
  try {
    await contract.mint(wallet.address, ethers.utils.parseUnits("10", 18));
    console.log("Mint Success!");

    // Get balance of our wallet
    const balance = await contract.balanceOf(wallet.address);
    const formattedBalance = ethers.utils.formatUnits(balance, 18);
    console.log(
      `Token balance of ${wallet.address}: ${formattedBalance} ${symbol}`
    );
  } catch (err) {
    console.log(err);
  }
};

callWriteFunction();
