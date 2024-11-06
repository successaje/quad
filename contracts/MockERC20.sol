// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20, Ownable {

    constructor(string memory name, string memory symbol, uint256 initialSupply) 
        ERC20(name, symbol)
        Ownable(msg.sender) // Set the initial owner
    {
        _mint(msg.sender, initialSupply);
    }

    /// @notice Allows the owner to mint tokens to any address
    /// @param account The address to receive the minted tokens
    /// @param amount The amount of tokens to mint
    function mint(address account, uint256 amount) external onlyOwner {
        _mint(account, amount);
    }

    /// @notice Allows the owner to burn tokens from any address
    /// @param account The address to burn tokens from
    /// @param amount The amount of tokens to burn
    function burn(address account, uint256 amount) external onlyOwner {
        _burn(account, amount);
    }
}
