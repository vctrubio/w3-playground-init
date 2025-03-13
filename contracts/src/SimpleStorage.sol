// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private value;
    
    event ValueChanged(address indexed author, uint256 oldValue, uint256 newValue);
    
    function setValue(uint256 newValue) public {
        uint256 oldValue = value;
        value = newValue;
        emit ValueChanged(msg.sender, oldValue, newValue);
    }
    
    function getValue() public view returns (uint256) {
        return value;
    }
}
