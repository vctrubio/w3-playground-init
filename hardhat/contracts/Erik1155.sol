// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

interface IErik {
    function mint(address to, uint256 id, uint256 amount) external;

    function burn(address from, uint256 id, uint256 amount) external;

    function balanceOf(
        address account,
        uint256 id
    ) external view returns (uint256);

    function getAllBalanceOf(
        address user
    ) external view returns (uint256[] memory);
}

contract Erik is ERC1155, IErik {
    uint256 public constant SEED = 0;
    uint256 public constant WATER = 1;
    uint256 public constant SOIL = 2;

    uint256 public constant PLANT = 3;
    uint256 public constant FRUIT = 4;
    uint256 public constant FLOWER = 5;
    uint256 public constant BASKET = 6;

    //todo: create assets
    constructor() ERC1155("https://myapi.com/metadata/{id}.json") {}

    event Mint(address indexed to, uint256 id, uint256 amount);
    event Burn(address indexed from, uint256 id, uint256 amount);

    function mint(address to, uint256 id, uint256 amount) external override {
        require(id >= 0 && id <= 6, "Invalid token ID");
        _mint(to, id, amount, "");
        emit Mint(to, id, amount);
    }

    function burn(address from, uint256 id, uint256 amount) external override {
        require(id >= 0 && id <= 6, "Invalid token ID");
        _burn(from, id, amount);
        emit Burn(from, id, amount);
    }

    function balanceOf(
        address account,
        uint256 id
    ) public view virtual override(ERC1155, IErik) returns (uint256) {
        return super.balanceOf(account, id);
    }

    function getAllBalanceOf(
        address user
    ) external view override returns (uint256[] memory) {
        uint256[] memory balances = new uint256[](7);

        for (uint256 i = 0; i < 7; i++) {
            balances[i] = balanceOf(user, i);
        }

        return balances;
    }
}

contract ErikForge {
    IErik public token;
    uint256 public constant COOLDOWN = 5 seconds;
    mapping(address => uint256) private lastMintTime;

    constructor(IErik _token) {
        token = _token;
    }

    function mint(uint256 tokenId) public {
        if (tokenId >= 0 && tokenId <= 2) {
            require(
                block.timestamp >= lastMintTime[msg.sender] + COOLDOWN,
                "Cooldown not elapsed"
            );
            token.mint(msg.sender, tokenId, 1);
            lastMintTime[msg.sender] = block.timestamp;
        } else if (tokenId == 3) {
            require(
                token.balanceOf(msg.sender, 0) > 0 &&
                    token.balanceOf(msg.sender, 1) > 0,
                "Need SEED and WATER to forge PLANT"
            );
            token.burn(msg.sender, 0, 1);
            token.burn(msg.sender, 1, 1);
            token.mint(msg.sender, tokenId, 1);
        } else if (tokenId == 4) {
            require(
                token.balanceOf(msg.sender, 1) > 0 &&
                    token.balanceOf(msg.sender, 2) > 0,
                "Need WATER and SOIL to forge FRUIT"
            );
            token.burn(msg.sender, 1, 1);
            token.burn(msg.sender, 2, 1);
            token.mint(msg.sender, tokenId, 1);
        } else if (tokenId == 5) {
            require(
                token.balanceOf(msg.sender, 0) > 0 &&
                    token.balanceOf(msg.sender, 2) > 0,
                "Need SEED and SOIL to forge FLOWER"
            );
            token.burn(msg.sender, 0, 1);
            token.burn(msg.sender, 2, 1);
            token.mint(msg.sender, tokenId, 1);
        } else if (tokenId == 6) {
            require(
                token.balanceOf(msg.sender, 0) > 0 &&
                    token.balanceOf(msg.sender, 1) > 0 &&
                    token.balanceOf(msg.sender, 2) > 0,
                "Need SEED, WATER and SOIL to forge BASKET"
            );
            token.burn(msg.sender, 0, 1);
            token.burn(msg.sender, 1, 1);
            token.burn(msg.sender, 2, 1);
            token.mint(msg.sender, tokenId, 1);
        } else {
            revert("Invalid token ID");
        }
    }

    function burn(uint256 id) public {
        require(id >= 3 && id <= 6, "Invalid token ID");
        require(
            token.balanceOf(msg.sender, id) > 0,
            "You don't own this token"
        );
        token.burn(msg.sender, id, 1);
    }

    function trade(uint256 tokenIn, uint256 tokenOut) public {
        require(
            tokenOut >= 0 && tokenOut <= 2,
            "Can only trade for basic tokens (0-2)"
        );
        require(
            token.balanceOf(msg.sender, tokenIn) > 0,
            "You don't own this token"
        );
        require(
            block.timestamp >= lastMintTime[msg.sender] + COOLDOWN,
            "Cooldown not elapsed"
        );

        token.burn(msg.sender, tokenIn, 1);
        token.mint(msg.sender, tokenOut, 1);
        lastMintTime[msg.sender] = block.timestamp;
    }

    function prettyPrintTokens(
        address user
    ) public view returns (uint256[] memory) {
        uint256[] memory balances = token.getAllBalanceOf(user);
        return (balances);
    }
}
