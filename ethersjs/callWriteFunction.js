const { ethers } = require("ethers");
const ABI = require("./ABI");

const callWriteFunction = async () => {
 // Create a provider instance
 const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161");

 // Create a wallet instance
 const wallet = new ethers.Wallet("9b998116762479b934f7cdfd44feba48329136eb755bf0da81364c12ac53725d", provider);

 // Create the contract instance and connect it to our wallet
 const contract = new ethers.Contract(
  "0xCC8048eF226eb2383B08949F752Cf31932d487cc",
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