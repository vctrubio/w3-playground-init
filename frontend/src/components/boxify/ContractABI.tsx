import React, { useState, useEffect } from "react";
import { Contract } from "@/lib/types";
import {
  parseAndCategorizeAbi,
  SolItem,
  SolItemType,
  formatContractResponse,
} from "@/lib/rpc-abi";
import { EtherscanIcon, WarningIcon } from "@/lib/svgs";
import { useUser } from "@/contexts/UserContext";

interface ContractState {
  [functionName: string]: {
    functionSol: SolItem;
    args?: Record<string, string>;
    loading: boolean;
    response?: string;
    trigger?: boolean;
  };
}

const FunctionSignature: React.FC<{
  functionSol: SolItem;
  color: string;
  args?: Record<string, string>;
  loading?: boolean;
  onInputChange?: (paramName: string, value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, paramName: string) => void;
  userAddress?: string;
}> = ({
  functionSol,
  color,
  args,
  loading,
  onInputChange,
  onKeyDown,
  userAddress,
}) => {
    return (
      <div className="font-mono text-sm">
        <span className="text-cyan-700 dark:text-purple-400">
          {functionSol.stateMutability}{" "}
        </span>
        <span className={`text-${color}-700 dark:text-${color}-400`}>
          {functionSol.type}{" "}
        </span>
        <span className="text-gray-900 text-orange-500 dark:text-white font-semibold">
          {functionSol.name}
        </span>
        <span className="text-gray-500 dark:text-gray-400">(</span>
        {functionSol.inputs.map((input, inputIndex) => {
          const paramKey = input.name || `param${inputIndex}`;
          const isAddressType = input.type.toLowerCase() === "address";
          return (
            <span key={inputIndex} className="inline-flex items-center">
              <span className="text-blue-700 dark:text-blue-400">
                {input.type}
              </span>
              {onInputChange ? (
                <div className="inline-flex items-center">
                  <input
                    type="text"
                    placeholder={input.name || `arg${inputIndex}`}
                    className="max-w-[120px] mx-1 px-2 py-0.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-white 
                          rounded border border-gray-300 dark:border-gray-700 
                          font-mono text-xs focus:border-blue-500 focus:outline-none disabled:opacity-50"
                    value={(args && args[paramKey]) || ""}
                    onChange={(e) => onInputChange(paramKey, e.target.value)}
                    onKeyDown={(e) => onKeyDown && onKeyDown(e, paramKey)}
                    disabled={loading}
                  />
                  {isAddressType && userAddress && (
                    <button
                      onClick={() => onInputChange(paramKey, userAddress)}
                      className="ml-1 p-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-xs"
                      disabled={loading}
                      title="Use my address"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-amber-600 dark:text-amber-300">
                  {" "}
                  {input.name}
                </span>
              )}
              {inputIndex < functionSol.inputs.length - 1 && (
                <span className="text-gray-500 dark:text-gray-400">, </span>
              )}
            </span>
          );
        })}
        <span className="text-gray-500 dark:text-gray-400">)</span>

        {functionSol.type === "function" &&
          functionSol.outputs &&
          functionSol.outputs.length > 0 && (
            <>
              <span className="text-gray-500 dark:text-gray-400"> → </span>
              {functionSol.outputs.length === 1 ? (
                <span className="text-blue-700 dark:text-blue-400">
                  {functionSol.outputs[0].type}
                </span>
              ) : (
                <>
                  <span className="text-gray-500 dark:text-gray-400">[</span>
                  {functionSol.outputs.map((output, outputIndex) => (
                    <span key={outputIndex}>
                      <span className="text-blue-700 dark:text-blue-400">
                        {output.type}
                      </span>
                      {output.name && (
                        <span className="text-amber-600 dark:text-amber-300">
                          {" "}
                          {output.name}
                        </span>
                      )}
                        {outputIndex < (functionSol.outputs?.length || 0) - 1 && (
                        <span className="text-gray-500 dark:text-gray-400">
                          ,{" "}
                        </span>
                      )}
                    </span>
                  ))}
                  <span className="text-gray-500 dark:text-gray-400">]</span>
                </>
              )}
            </>
          )}
      </div>
    );
  };

const ContractFunction: React.FC<{
  functionName: string;
  contractState: ContractState;
  setContractState?: React.Dispatch<React.SetStateAction<ContractState>>;
  userAddress?: string | null;
}> = ({ functionName, contractState, setContractState, userAddress }) => {
  const funcState = contractState[functionName];
  const solItem = funcState.functionSol;
  const isFunction = solItem.type === "function";

  const getTypeStyles = () => {
    switch (solItem.itemType) {
      case SolItemType.READ:
        return "bg-blue-100/80 dark:bg-blue-900/30 hover:bg-blue-200/80 dark:hover:bg-blue-900/40 border-l-4 border-blue-500 dark:border-blue-700";
      case SolItemType.WRITE:
        return "bg-green-100/80 dark:bg-green-900/30 hover:bg-green-200/80 dark:hover:bg-green-900/40 border-l-4 border-green-500 dark:border-green-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700";
    }
  };

  const getColor = () => {
    switch (solItem.itemType) {
      case SolItemType.READ:
        return "sky";
      case SolItemType.WRITE:
        return "green";
      default:
        return "grey";
    }
  };

  const handleInputChange = (paramName: string, value: string) => {
    if (!setContractState) return;
    setContractState((prev) => {
      const newState = { ...prev };
      newState[functionName] = {
        ...funcState,
        args: {
          ...(funcState.args || {}),
          [paramName]: value,
        },
      };
      return newState;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, paramName: string) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleExecute();
    }
  };

  const handleExecute = () => {
    if (!setContractState || funcState.loading) return;

    if (solItem.inputs.length > 0) {
      const currentArgs = funcState.args || {};
      const missingArgs = solItem.inputs.filter((input, idx) => {
        const paramKey = input.name || `param${idx}`;
        return !currentArgs[paramKey] || currentArgs[paramKey].trim() === "";
      });

      if (missingArgs.length > 0) {
        const missingNames = missingArgs
          .map((input) => input.name || "unnamed parameter")
          .join(", ");
        setContractState((prev) => {
          const newState = { ...prev };
          newState[functionName] = {
            ...funcState,
            response: `Error: Missing required arguments: ${missingNames}`,
          };
          return newState;
        });
        return;
      }
    }

    setContractState((prev) => {
      const newState = { ...prev };
      newState[functionName] = {
        ...funcState,
        loading: true,
        trigger: true,
        response: undefined,
      };
      return newState;
    });
  };

  return (
    <li className="mb-2 overflow-hidden rounded-md shadow-sm">
      <div className={`p-3 transition-colors ${getTypeStyles()}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <FunctionSignature
            functionSol={solItem}
            color={getColor()}
            args={funcState.args}
            loading={funcState.loading}
            onInputChange={setContractState ? handleInputChange : undefined}
            onKeyDown={setContractState ? handleKeyDown : undefined}
            userAddress={userAddress || undefined}
          />

          {isFunction && setContractState && (
            <div className="flex mt-2 md:mt-0 items-center">
              <button
                onClick={handleExecute}
                disabled={funcState.loading}
                className={`ml-4 px-2 py-1 rounded text-white text-xs
                  ${solItem.itemType === SolItemType.READ
                    ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    : "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {funcState.loading ? (
                  <div className="flex items-center">
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                  </div>
                ) : (
                  <span>
                    {solItem.itemType === SolItemType.READ ? "Read" : "Write"}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {funcState.response && (
          <div className="mt-2 bg-white/70 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-2 rounded text-sm text-gray-800 dark:text-gray-300 font-mono">
            <pre className="whitespace-pre-wrap overflow-x-auto">
              {funcState.response.replace("Result: ", "")}
            </pre>
          </div>
        )}
      </div>
    </li>
  );
};

const ContractABI = ({
  contract,
  name,
  userAddress,
}: {
  contract: Contract | null;
  name?: string;
  userAddress?: string | null;
}) => {
  const [contractState, setContractState] = useState<ContractState>(() => {
    if (!contract || !contract.abi) return {};

    const { reads, writes } = parseAndCategorizeAbi(contract.abi);
    const initialState: ContractState = {};

    [...reads, ...writes].forEach((solItem) => {
      initialState[solItem.name] = {
        functionSol: solItem,
        loading: false,
        args: {},
        trigger: false,
      };
    });

    return initialState;
  });

  useEffect(() => {
    const triggeredContract = Object.entries(contractState).find(
      ([_, state]) => state.trigger === true,
    );

    if (triggeredContract) {
      runExecute(triggeredContract);
    }
  }, [contractState]);

  if (!contract || !contract.abi) {
    return <NoAbiProvided />;
  }

  const { reads, writes } = parseAndCategorizeAbi(contract.abi);

  const runExecute = async (
    triggeredContract: [string, ContractState[string]],
  ) => {
    const [functionName, funcState] = triggeredContract;

    // console.log('Executing function:', functionName);
    // console.log('Function type:', funcState.functionSol.itemType);
    // console.log('Arguments:', funcState.args);

    try {
      const args = funcState.functionSol.inputs.map((input, idx) => {
        const paramKey = input.name || `param${idx}`;
        return funcState.args?.[paramKey] || "";
      });

      if (!contract.instance) {
        throw new Error("Contract instance not available");
      }

      let result;

      if (funcState.functionSol.itemType === SolItemType.WRITE) {
        const tx = await contract.instance[functionName](...args);

        const receipt = await tx.wait();
        result = receipt;
        console.log("Transaction receipt:", receipt);
      } else {
        result = await contract.instance[functionName](...args);
      }

      const safeResult = formatContractResponse(result);
      let formattedResult;

      if (safeResult === null) {
        formattedResult = "null";
      } else if (typeof safeResult === "string") {
        formattedResult = safeResult;
      } else {
        try {
          formattedResult = JSON.stringify(safeResult, null, 2);
        } catch (jsonError) {
          console.error("Error stringifying result:", jsonError);
          formattedResult = "Error displaying JSON result...";
        }
      }

      setContractState((prev) => {
        const newState = { ...prev };
        newState[functionName] = {
          ...funcState,
          loading: false,
          trigger: false,
          response: `Result: ${formattedResult}`,
        };
        return newState;
      });
    } catch (e) {
      console.error("Error executing function:", e);

      setContractState((prev) => {
        const newState = { ...prev };
        newState[functionName] = {
          ...funcState,
          loading: false,
          trigger: false,
          response: `Error: ${(e as Error).message || "Unknown error occurred"}`,
        };
        return newState;
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-2 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
      <ContractHeader contract={contract} />

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="font-mono text-sm">
          <span className="text-blue-700 dark:text-blue-400">contract</span>
          <span className="text-purple-700 dark:text-purple-400">
            {" "}
            {name || (contract && contract.name) || "Contract"}{" "}
          </span>
          <span className="text-gray-500 dark:text-gray-400">{"{"}</span>
        </div>

        <div className="pl-4 mt-2">
          <ContractSection title="Read Functions" isEmpty={reads.length === 0}>
            <ul>
              {reads.map((solItem, idx) => (
                <ContractFunction
                  key={idx}
                  functionName={solItem.name}
                  contractState={contractState}
                  setContractState={setContractState}
                  userAddress={userAddress}
                />
              ))}
            </ul>
          </ContractSection>

          <ContractSection
            title="Write Functions"
            isEmpty={writes.length === 0}
          >
            <ul>
              {writes.map((solItem, idx) => (
                <ContractFunction
                  key={idx}
                  functionName={solItem.name}
                  contractState={contractState}
                  setContractState={setContractState}
                  userAddress={userAddress}
                />
              ))}
            </ul>
          </ContractSection>
        </div>

        <div className="font-mono text-sm">
          <span className="text-gray-500 dark:text-gray-400">{"}"}</span>
        </div>
      </div>
    </div>
  );
};

function ContractPage() {
  const { contract, user, parentContract } = useUser();

  const userAddress = user?.address || null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl px-4">
        <ContractABI
          contract={contract}
          name="GamePlay"
          userAddress={userAddress}
        />
        <ContractABI
          contract={parentContract}
          name="ERC1155"
          userAddress={userAddress}
        />
      </div>
    </div>
  );
}

const NoAbiProvided: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg text-gray-800 dark:text-gray-200">
    <div className="flex flex-col items-center justify-center py-8">
      <WarningIcon className="h-16 w-16 text-red-600 dark:text-red-400 mb-4" />
      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
        No ABI Provided
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Contract ABI is required to display functions.
        <br />
        Please provide a valid ABI to interact with the contract.
      </p>
    </div>
  </div>
);

const ContractHeader: React.FC<{ contract: Contract; name?: string }> = ({
  contract,
  name,
}) => (
  <div className="mb-6 border-b border-[#dce0e8] dark:border-gray-700 pb-4">
    {contract.address && (
      <div className="flex space-x-4 mt-2">
        {/* <a
          href={`https://testnets.opensea.io/assets/sepolia/${contract.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8839ef] hover:text-[#7287fd] dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium flex items-center"
        >
          <OpenSeaIcon />
          View on OpenSea
        </a> */}
        <a
          href={`https://sepolia.etherscan.io/address/${contract.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8839ef] hover:text-[#7287fd] dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium flex items-center"
        >
          <EtherscanIcon />
          View on Etherscan
        </a>
      </div>
    )}
  </div>
);

const ContractSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isEmpty: boolean;
}> = ({ title, children, isEmpty }) => (
  <div className="mb-4">
    {isEmpty ? (
      <p className="text-gray-600 dark:text-gray-400 italic pl-4">
        // No {title.toLowerCase()} found.
      </p>
    ) : (
      children
    )}
  </div>
);

export default ContractPage;
