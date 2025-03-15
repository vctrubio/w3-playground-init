import {helloEthers, helloEthersFather, getContractInfo, sendSimpleTransaction, readContractData, analyzeTransaction} from '@/lib/ethera';
import { 
  getERC20TokenInfo, 
  checkERC20Allowance, 
  prepareERC20Transfer,
  getNFTCollectionInfo,
  getNFTDetails,
  getERC1155Balances,
  detectContractStandard,
  getNFTsOwnedByAddress,
  checkERC1155OperatorApproval,
  getERC20BalanceForAddress
} from '@/lib/etherav2';
import { useState } from 'react';

interface ButtonConfig {
    label: string;
    action: () => void;
}

interface InputFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const InputField = ({ id, label, value, onChange, placeholder }: InputFieldProps) => (
    <div className="flex flex-col mb-2">
        <label htmlFor={id} className="text-sm mb-1">{label}</label>
        <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        />
    </div>
);

export default function Contract(): JSX.Element {
    const [result, setResult] = useState<string>('');
    const [inputs, setInputs] = useState({
        tokenAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Default to WETH
        nftAddress: '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',    // BAYC
        tokenId: '1',
        recipientAddress: '',
        amount: '0.01',
        spenderAddress: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap Router
        holderAddress: '',
        operatorAddress: '',
        tokenIds: '1,2,3' // For ERC1155 multiple token IDs
    });

    const handleInputChange = (id: string, value: string) => {
        setInputs(prev => ({ ...prev, [id]: value }));
    };

    const buttons: ButtonConfig[] = [
        {
            label: "helloEthers",
            action: async () => {
                try {
                    const response = await helloEthers();
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "helloEthersFather",
            action: async () => {
                try {
                    const response = await helloEthersFather();
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "Get Contract Info",
            action: async () => {
                try {
                    const response = await getContractInfo();
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "Prepare Transaction",
            action: async () => {
                try {
                    const response = await sendSimpleTransaction();
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "Read ERC20 Data",
            action: async () => {
                try {
                    const response = await readContractData();
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "Analyze Transaction",
            action: async () => {
                try {
                    const response = await analyzeTransaction();
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }
    ];

    // Advanced buttons using etherav2 functions
    const advancedButtons: ButtonConfig[] = [
        {
            label: "Detect Contract Type",
            action: async () => {
                try {
                    const contractAddress = inputs.tokenAddress || inputs.nftAddress;
                    if (!contractAddress) {
                        setResult("Please enter a contract address first");
                        return;
                    }
                    const response = await detectContractStandard(contractAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "ERC20 Token Info",
            action: async () => {
                try {
                    if (!inputs.tokenAddress) {
                        setResult("Please enter a token address first");
                        return;
                    }
                    const response = await getERC20TokenInfo(inputs.tokenAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "ERC20 Balance",
            action: async () => {
                try {
                    if (!inputs.tokenAddress || !inputs.holderAddress) {
                        setResult("Please enter token and holder addresses");
                        return;
                    }
                    const response = await getERC20BalanceForAddress(inputs.tokenAddress, inputs.holderAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "ERC20 Allowance",
            action: async () => {
                try {
                    if (!inputs.tokenAddress || !inputs.spenderAddress) {
                        setResult("Please enter token and spender addresses");
                        return;
                    }
                    const response = await checkERC20Allowance(inputs.tokenAddress, inputs.spenderAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "Prepare ERC20 Transfer",
            action: async () => {
                try {
                    if (!inputs.tokenAddress || !inputs.recipientAddress || !inputs.amount) {
                        setResult("Please enter token address, recipient, and amount");
                        return;
                    }
                    const response = await prepareERC20Transfer(
                        inputs.tokenAddress, 
                        inputs.recipientAddress, 
                        inputs.amount
                    );
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "NFT Collection Info",
            action: async () => {
                try {
                    if (!inputs.nftAddress) {
                        setResult("Please enter an NFT contract address");
                        return;
                    }
                    const response = await getNFTCollectionInfo(inputs.nftAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "NFT Token Details",
            action: async () => {
                try {
                    if (!inputs.nftAddress || !inputs.tokenId) {
                        setResult("Please enter NFT address and token ID");
                        return;
                    }
                    const response = await getNFTDetails(inputs.nftAddress, inputs.tokenId);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "NFTs By Owner",
            action: async () => {
                try {
                    if (!inputs.nftAddress || !inputs.holderAddress) {
                        setResult("Please enter NFT address and owner address");
                        return;
                    }
                    const response = await getNFTsOwnedByAddress(inputs.nftAddress, inputs.holderAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "ERC1155 Balances",
            action: async () => {
                try {
                    if (!inputs.nftAddress || !inputs.tokenIds) {
                        setResult("Please enter ERC1155 address and token IDs");
                        return;
                    }
                    // Convert comma-separated tokenIds to array
                    const tokenIdArray = inputs.tokenIds
                        .split(',')
                        .map(id => id.trim())
                        .filter(id => id);
                        
                    const response = await getERC1155Balances(inputs.nftAddress, tokenIdArray);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        {
            label: "ERC1155 Approval",
            action: async () => {
                try {
                    if (!inputs.nftAddress || !inputs.operatorAddress) {
                        setResult("Please enter ERC1155 address and operator address");
                        return;
                    }
                    const response = await checkERC1155OperatorApproval(inputs.nftAddress, inputs.operatorAddress);
                    setResult(JSON.stringify(response, null, 2));
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
    ];

    return (
        <div className="p-4 space-y-4">
            <div className="text-xl font-bold">Contracts</div>
            <div className="mb-4">Contract Information</div>
            
            {/* Basic functions */}
            <div>
                <h3 className="mb-2 font-semibold">Basic Functions</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {buttons.map((btn, index) => (
                        <button
                            key={index}
                            onClick={btn.action}
                            className="dark:bg-blue-500 bg-orange-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Input fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <InputField
                    id="tokenAddress"
                    label="ERC20 Token Address"
                    value={inputs.tokenAddress}
                    onChange={(value) => handleInputChange("tokenAddress", value)}
                    placeholder="0x..."
                />
                <InputField
                    id="nftAddress"
                    label="NFT Address (ERC721/ERC1155)"
                    value={inputs.nftAddress}
                    onChange={(value) => handleInputChange("nftAddress", value)}
                    placeholder="0x..."
                />
                <InputField
                    id="tokenId"
                    label="Token ID"
                    value={inputs.tokenId}
                    onChange={(value) => handleInputChange("tokenId", value)}
                    placeholder="1"
                />
                <InputField
                    id="recipientAddress"
                    label="Recipient Address"
                    value={inputs.recipientAddress}
                    onChange={(value) => handleInputChange("recipientAddress", value)}
                    placeholder="0x..."
                />
                <InputField
                    id="amount"
                    label="Token Amount"
                    value={inputs.amount}
                    onChange={(value) => handleInputChange("amount", value)}
                    placeholder="0.01"
                />
                <InputField
                    id="spenderAddress"
                    label="Spender Address"
                    value={inputs.spenderAddress}
                    onChange={(value) => handleInputChange("spenderAddress", value)}
                    placeholder="0x..."
                />
                <InputField
                    id="holderAddress"
                    label="Holder/Owner Address"
                    value={inputs.holderAddress}
                    onChange={(value) => handleInputChange("holderAddress", value)}
                    placeholder="0x..."
                />
                <InputField
                    id="operatorAddress"
                    label="Operator Address"
                    value={inputs.operatorAddress}
                    onChange={(value) => handleInputChange("operatorAddress", value)}
                    placeholder="0x..."
                />
                <InputField
                    id="tokenIds"
                    label="Token IDs (comma-separated)"
                    value={inputs.tokenIds}
                    onChange={(value) => handleInputChange("tokenIds", value)}
                    placeholder="1,2,3"
                />
            </div>
            
            {/* Advanced functions */}
            <div>
                <h3 className="mb-2 font-semibold">Advanced Functions</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                    {advancedButtons.map((btn, index) => (
                        <button
                            key={index}
                            onClick={btn.action}
                            className="dark:bg-green-600 bg-purple-600 hover:bg-purple-700 dark:hover:bg-green-700 text-white py-2 px-4 rounded"
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {result && (
                <div className="mt-4 p-3 rounded border">
                    <pre className="whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">{result}</pre>
                </div>
            )}
        </div>
    );
}