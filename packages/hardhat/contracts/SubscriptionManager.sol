// SPDX-License: SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SubscriptionManager {
    IERC20 public usdcToken;
    uint256 public subscriptionPrice = 5 * 10**6; // $5 USDC (6 decimals)
    uint32 public subscriptionDuration = 2592000; // 30 days in seconds

    mapping(address => uint256) public subscriptionEndTimes;

    event Subscribed(address indexed user, uint256 endTime);

    constructor(address usdcAddress) {
        usdcToken = IERC20(usdcAddress);
    }

    function subscribe() external {
        require(usdcToken.transferFrom(msg.sender, address(this), subscriptionPrice), "Payment failed");
        uint256 newEndTime = block.timestamp + subscriptionDuration;
        if (subscriptionEndTimes[msg.sender] > block.timestamp) {
            newEndTime = subscriptionEndTimes[msg.sender] + subscriptionDuration;
        }
        subscriptionEndTimes[msg.sender] = newEndTime;
        emit Subscribed(msg.sender, newEndTime);
    }

    function isSubscribed(address user) external view returns (bool) {
        return subscriptionEndTimes[user] > block.timestamp;
    }
}