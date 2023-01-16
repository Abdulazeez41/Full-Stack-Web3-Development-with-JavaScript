const { ethers } = require("ethers");

const readChainData = async () => {
  // 1. Create a provider instance
  const provider = new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/INFURA-KEY"
  );

  // 2. Get current block number
  const blockNumber = await provider.getBlockNumber();
  console.log("Block Number:", blockNumber);

  // 3. Get ethers balance for a specific wallet
  const balance = await provider.getBalance("WALLET-OR-CONTRACT-ADDRESS-HERE");
  const formattedBalance = ethers.utils.formatEther(balance);
  console.log("Balance:", formattedBalance, "ether");
};

readChainData();
