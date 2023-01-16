const { ethers } = require("ethers");

const eventListener = () => {
 const provider = new ethers.providers.JsonRpcProvider(
  "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
 );

 const topicSetsFilter = [
  ethers.utils.id("Transfer(address,address,uint256)"),
 ];

 provider.on(topicSetsFilter, (res) => {
  console.log(res);
 });
};

eventListener();