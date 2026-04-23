// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockFailingERC20 {
    function transferFrom(
        address,
        address,
        uint256
    ) external pure returns (bool) {
        return false;
    }
}
