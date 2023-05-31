// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.10;

interface ISuperFractionalized {
    function initialize(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        uint256 tokenId_,
        address tokenAddress_,
        address recipient
    ) external;

    function tokenURI() external view returns (string memory _uri);
}
