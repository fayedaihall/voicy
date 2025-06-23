// SPDX-License: SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VoiceRegistry is Ownable {
    struct Voice {
        address owner;
        string ipfsHash; // IPFS hash of the original audio
        string modelId; // AI API model ID for the voice model
        bool exists;
    }

    mapping(uint256 => Voice) public voices;
    uint256 public voiceCount;

    event VoiceRegistered(uint256 indexed voiceId, address indexed owner, string ipfsHash, string modelId);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function registerVoice(string memory ipfsHash, string memory modelId) external {
        voiceCount++;
        voices[voiceCount] = Voice({
            owner: msg.sender,
            ipfsHash: ipfsHash,
            modelId: modelId,
            exists: true
        });

        emit VoiceRegistered(voiceCount, msg.sender, ipfsHash, modelId);
    }

    function getVoice(uint256 id) external view returns (address owner, string memory ipfsHash, string memory modelId) {
        require(voices[id].exists, "Voice does not exist");
        return (voices[id].owner, voices[id].ipfsHash, voices[id].modelId);
    }
}