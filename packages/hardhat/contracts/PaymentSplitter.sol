// SPDX-License: SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./VoiceRegistry.sol";

contract PaymentSplitter {
    IERC20 public usdcToken;
    VoiceRegistry public voiceRegistry;
    address public platformWallet;
    uint256 public voiceUsageFee = 25 * 10**4; // $0.25 USDC (6 decimals)
    uint256 public voiceOwnerShare = 20 * 10**4; // $0.20 USDC
    uint256 public platformShare = 5 * 10**4; // $0.05 USDC

    event PaymentSplit(uint256 indexed voiceId, address indexed voiceOwner, address indexed user);

    constructor(address usdcAddress, address voiceRegistryAddress, address _platformWallet) {
        usdcToken = IERC20(usdcAddress);
        voiceRegistry = VoiceRegistry(voiceRegistryAddress);
        platformWallet = _platformWallet;
    }

    function useVoice(uint256 voiceId) external {
        (address voiceOwner, , ) = voiceRegistry.getVoice(voiceId);
        require(voiceOwner != address(0), "Invalid voice ID");
        require(usdcToken.transferFrom(msg.sender, address(this), voiceUsageFee), "Payment failed");
        require(usdcToken.transfer(voiceOwner, voiceOwnerShare), "Voice owner payment failed");
        require(usdcToken.transfer(platformWallet, platformShare), "Platform payment failed");
        emit PaymentSplit(voiceId, voiceOwner, msg.sender);
    }
}