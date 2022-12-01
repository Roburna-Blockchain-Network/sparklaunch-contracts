// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SaleToken is ERC20 {
    constructor(
        string memory _name,
        string memory _symbol,
        address receiver
    ) ERC20(_name, _symbol) {
        _mint(receiver, 10**27);
    }
}
