// SPDX-License-Identifier: AGPLv3
pragma solidity ^0.8.10;

import {UUPSProxy} from "./utils/UUPSProxy.sol";
import {ISuperFractionalized} from "./interfaces/ISuperFractionalized.sol";

import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperToken.sol";

contract SuperFractionalized is UUPSProxy, ISuperFractionalized {
    uint256[32] internal _storagePaddings;

    uint256 public tokenId;

    address public tokenAddress;

    function initialize(
        string memory name,
        string memory symbol,
        uint256 initalSupply,
        uint256 tokenId_,
        address tokenAddress_,
        address recipient
    ) external override {
        tokenId = tokenId_;
        tokenAddress = tokenAddress_;
        ISuperToken(address(this)).initialize(
            IERC20(address(0)),
            0,
            name,
            symbol
        );

        ISuperToken(address(this)).selfMint(
            recipient,
            initalSupply,
            new bytes(0)
        );
    }

    function tokenURI() public view returns (string memory _uri) {
        return IERC721Metadata(tokenAddress).tokenURI(tokenId);
    }
}
