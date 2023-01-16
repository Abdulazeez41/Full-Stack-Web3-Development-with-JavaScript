const { ethers } = require("ethers");

const signMessage = async () => {
  // Create a provider instance
  const provider = new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/INFURA-KEY"
  );

  // Create a wallet instance
  const wallet = new ethers.Wallet("PRIVATE-KEY", provider);
  let message = "ethers.js is a powerful library";
  // Sign the message
  const output = await wallet.signMessage(message);
  console.log("signature of message:", output);
};

signMessage();
