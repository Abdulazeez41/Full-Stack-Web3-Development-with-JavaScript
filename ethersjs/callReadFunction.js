const { ethers } = require("ethers");
const ABI = require("./ABI");

const callReadFunction = async () => {
  // 1. Create a provider instance
  const provider = new ethers.providers.JsonRpcProvider(
    "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
  );

  // 2. Create the contract instance and connect it to provider
  const contract = new ethers.Contract(
    "0xCC8048eF226eb2383B08949F752Cf31932d487cc",
    ABI.humanReadableABI,
    provider
  );

  // 3. Getting ERC20 token symbol
  const symbol = await contract.symbol();
  console.log("Symbol:", symbol);

  // 4. Getting ERC20 total supply value
  const totalSupply = await contract.totalSupply();
  const formattedTotalSupply = ethers.utils.formatUnits(totalSupply, 18);
  console.log("Total supply:", formattedTotalSupply, symbol);

  // 5. Getting an ERC20 balance for specific wallet
  const balance = await contract.balanceOf(
    "0x99e2c9AF5Ce547907Ff2389DA5F34277cDcd0497"
  );
  const formattedBalance = ethers.utils.formatUnits(balance, 18);
  console.log("Token Balance:", formattedBalance, symbol);
};

callReadFunction();
