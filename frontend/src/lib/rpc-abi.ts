export enum SolItemType {
  READ = "read",
  WRITE = "write",
  EVENT = "event",
}

export interface SolParam {
  name: string;
  type: string;
}

export interface SolItem {
  name: string;
  type: "function" | "event" | "error" | "constructor";
  inputs: SolParam[];
  outputs?: SolParam[];
  stateMutability?: string;
  itemType?: SolItemType; // Used to categorize as READ, WRITE, EVENT
}

// AIHelper function to parse ABI
export const parseAbiString = (abiString: string): SolItem | null => {
  const parts = abiString.match(
    /(constructor|error|event|function)\s+(\w+)\s*\((.*?)\)(?:\s+(view|pure))?(?:\s+returns\s*\((.*?)\))?/i
  );
  if (!parts) return null;

  const [, type, name, inputsStr, stateMutability, outputsStr] = parts;

  const parseParams = (str?: string): SolParam[] => {
    if (!str) return [];
    return str.split(",").map((param, index) => {
      const [type, name = `arg${index}`] = param.trim().split(/\s+/).reverse();
      return { name, type };
    });
  };

  // Determine the itemType
  let itemType: SolItemType | undefined;
  if (type === "event") {
    itemType = SolItemType.EVENT;
  } else if (type === "function") {
    itemType =
      stateMutability === "view" || stateMutability === "pure"
        ? SolItemType.READ
        : SolItemType.WRITE;
  }

  return {
    type: type as "function" | "event" | "error" | "constructor",
    name,
    inputs: parseParams(inputsStr),
    outputs: type === "function" ? parseParams(outputsStr || "") : undefined,
    stateMutability:
      stateMutability || (type === "function" ? "nonpayable" : undefined),
    itemType,
  };
};

// Parse and categorize ABI
export const parseAndCategorizeAbi = (abi: any) => {
  const abiAsStringArray =
    typeof abi === "string"
      ? [abi]
      : Array.isArray(abi)
      ? abi.map((item) =>
          typeof item === "string" ? item : JSON.stringify(item)
        )
      : [];

  const abiJson = abiAsStringArray
    .map(parseAbiString)
    .filter(Boolean) as SolItem[];

  const reads = abiJson.filter((item) => item.itemType === SolItemType.READ);
  const writes = abiJson.filter((item) => item.itemType === SolItemType.WRITE);
  const events = abiJson.filter((item) => item.itemType === SolItemType.EVENT);

  return { reads, writes, events };
};

// Format contract response values to handle BigInt and other special types
export const formatContractResponse = (value: any): any => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return null;
  }

  // Handle BigInt values
  if (typeof value === "bigint") {
    return value.toString();
  }

  // Handle arrays - recursively convert each item
  if (Array.isArray(value)) {
    return value.map(formatContractResponse);
  }

  // Handle objects with toString method (like BigNumber)
  if (value && typeof value === "object") {
    // Special case for objects that have toString method, like ethers BigNumber
    if (
      typeof value.toString === "function" &&
      // Avoid calling toString on objects where it just returns the default [object Object]
      value.toString !== Object.prototype.toString
    ) {
      return value.toString();
    }

    // Handle regular objects - recursively process their properties
    if (value.constructor === Object) {
      const result: Record<string, any> = {};
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          result[key] = formatContractResponse(value[key]);
        }
      }
      return result;
    }
  }

  // Return other primitive values as-is
  return value;
};
