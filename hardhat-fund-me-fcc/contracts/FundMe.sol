// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

error FundMe__NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    // Mapping to store the amount funded by each address
    mapping(address => uint256) private s_addressToAmountFunded;

    // Array to store the addresses of contributors (funders)
    address[] private s_funders;

    // Owner of the contract, set at deployment
    address private immutable i_owner;

    // Minimum amount in USD required to contribute
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    // Chainlink Price Feed interface
    AggregatorV3Interface public s_priceFeed;

    /**
     * @dev Contract constructor.
     * @param priceFeedAddress The address of the Chainlink Price Feed contract.
     */
    constructor(address priceFeedAddress) {
        // Set the contract deployer as the owner
        i_owner = msg.sender;

        // Initialize the Chainlink Price Feed
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    /**
     * @dev Fallback function to accept ETH contributions.
     */
    receive() external payable {
        fund();
    }

    /**
     * @dev Fallback function to accept ETH contributions.
     */
    fallback() external payable {
        fund();
    }

    /**
     * @dev Contribute ETH to the crowdfunding campaign.
     */
    function fund() public payable {
        // Check if the contributed amount meets the minimum USD requirement
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );

        // Update the amount funded by the contributor
        s_addressToAmountFunded[msg.sender] += msg.value;

        // Add the contributor to the list of funders
        s_funders.push(msg.sender);
    }

    /**
     * @dev Modifier to restrict a function to only the owner of the contract.
     */
    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    /**
     * @dev Withdraw all funds from the contract, available only to the owner.
     */
    function withdraw() public onlyOwner {
        // Iterate through funders and reset their funded amounts
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        // Clear the list of funders
        s_funders = new address[](0);

        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");

        // call
        // Transfer the contract's balance to the owner
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    /**
     * @dev Withdraw all funds from the contract more efficiently, available only to the owner.
     */
    function cheaperWithdraw() public onlyOwner {
        // Use a memory array to store funders and iterate through it
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // Clear the list of funders
        s_funders = new address[](0);

        // Transfer the contract's balance to the owner
        (bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    // View/Pure functions to retrieve information from the contract

    /**
     * @dev View function to get the owner of the contract.
     * @return The address of the contract owner.
     */
    function getOwner() public view returns (address) {
        return i_owner;
    }

    /**
     * @dev View function to get the address of a funder at a specific index.
     * @param index The index of the funder in the list.
     * @return The address of the funder.
     */
    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    /**
     * @dev View function to get the amount funded by a specific address.
     * @param funder The address of the funder.
     * @return The amount funded by the specified address.
     */
    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    /**
     * @dev View function to get the Chainlink Price Feed contract.
     * @return The address of the Chainlink Price Feed contract.
     */
    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly

// Explainer from: https://solidity-by-example.org/fallback/
// Ether is sent to contract
//      is msg.data empty?
//          /   \
//         yes  no
//         /     \
//    receive()?  fallback()
//     /   \
//   yes   no
//  /        \
//receive()  fallback()
