// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

/*
deployed firt on remix logs::
https://sepolia.etherscan.io/tx/0x37662d27d852c0de544aa3b945b67ea87c48860c96358cf37871f54e12758577
tx: 0x37662d27d852c0de544aa3b945b67ea87c48860c96358cf37871f54e12758577
from: 0x34b68353F8753F7e019987168b1Eacf0F76AE5c9
to: 0x7a32108df38cc184fc7bfca7b477e7767d19590d

https://testnets.opensea.io/collection/unidentified-contract-c4b7a0b5-1859-4449-8b4e-ed33
*/

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
