// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract HouseUrban is ERC1155 {
    string public tokenName = "HouseUrban";
    string public symbol = "HHU";
    string public uri =
        "ipfs://QmW4mpt7g4dxxWzPB8A6HRkTfUP9WGNuPN1hWRXbicimzq/{id}.json";
    uint private sizeOfCollection = 3;

    uint256 public constant FRONT = 0;
    uint256 public constant MIDDLE = 1;
    uint256 public constant BACK = 2;

    constructor() ERC1155(uri) {
        _mint(msg.sender, FRONT, 10 ** 18, "");
        _mint(msg.sender, MIDDLE, 10 ** 27, "");
        _mint(msg.sender, BACK, 1, "");
    }
}
