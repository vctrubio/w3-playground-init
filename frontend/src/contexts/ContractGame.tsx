export const contractGame = {
    name: "ErikForge",
    address: "0xB8614eAe091F19c31eF59dd14FBF8086205BE958",
    networkName: "sepolia",
    networkId: 11155111,
    abi: [
        "constructor(address)",
        "function COOLDOWN() view returns (uint256)",
        "function burn(uint256)",
        "function mint(uint256)",
        "function prettyPrintTokens(address) view returns (uint256[])",
        "function token() view returns (address)",
        "function trade(uint256,uint256)"
    ],
}

export const contractMain = {
    name: "Erik",
    address: "0xc6C927e94b3f28c6C905941e9Fb023eD44C14c06",
    network: "sepolia",
    chainId: 11155111,
    abi: [
        "constructor()",
        "error ERC1155InsufficientBalance(address,uint256,uint256,uint256)",
        "error ERC1155InvalidApprover(address)",
        "error ERC1155InvalidArrayLength(uint256,uint256)",
        "error ERC1155InvalidOperator(address)",
        "error ERC1155InvalidReceiver(address)",
        "error ERC1155InvalidSender(address)",
        "error ERC1155MissingApprovalForAll(address,address)",
        "event ApprovalForAll(address indexed,address indexed,bool)",
        "event TransferBatch(address indexed,address indexed,address indexed,uint256[],uint256[])",
        "event TransferSingle(address indexed,address indexed,address indexed,uint256,uint256)",
        "event URI(string,uint256 indexed)",
        "function BASKET() view returns (uint256)",
        "function FLOWER() view returns (uint256)",
        "function FRUIT() view returns (uint256)",
        "function PLANT() view returns (uint256)",
        "function SEED() view returns (uint256)",
        "function SOIL() view returns (uint256)",
        "function WATER() view returns (uint256)",
        "function balanceOf(address,uint256) view returns (uint256)",
        "function balanceOfBatch(address[],uint256[]) view returns (uint256[])",
        "function burn(address,uint256,uint256)",
        "function getAllBalanceOf(address) view returns (uint256[])",
        "function isApprovedForAll(address,address) view returns (bool)",
        "function mint(address,uint256,uint256)",
        "function safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
        "function safeTransferFrom(address,address,uint256,uint256,bytes)",
        "function setApprovalForAll(address,bool)",
        "function supportsInterface(bytes4) view returns (bool)",
        "function uri(uint256) view returns (string)"
    ],
}
//todo is add Events.

