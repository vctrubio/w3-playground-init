import { Contract } from "./types";

export async function executeContract({
  contract,
  functionName,
  functionArgs = [],
}: {
  contract: Contract;
  functionName: string;
  functionArgs?: any[];
}) {
  try {
    if (!contract.instance || !contract.address) {
      throw new Error("Contract instance or address is not defined");
    }

    // Get function info
    const functionFragment =
      contract.instance.interface.getFunction(functionName);
    if (!functionFragment) {
      throw new Error(`Function ${functionName} not found in contract ABI`);
    }

    const isRead = ["view", "pure"].includes(functionFragment.stateMutability);
    const isWrite = ["nonpayable", "payable"].includes(
      functionFragment.stateMutability
    );

    if (isRead) {
      console.log(`Executing read operation on contract: ${contract.address}`);
      const result = await contract.instance[functionName](...functionArgs);
      return result;
    } else if (isWrite) {
      console.log(`Executing write operation on contract: ${contract.address}`);
      const tx = await contract.instance[functionName](...functionArgs);
      return tx;
    } else {
      throw new Error(
        `Unknown state mutability: ${functionFragment.stateMutability}`
      );
    }
  } catch (e) {
    console.error(`Error executing contract function ${functionName}:`, e);
    throw e;
  }
}
