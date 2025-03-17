// Check if running in Bun
if (typeof Bun === "undefined") {
  console.error("\x1b[31mError: This script must be run with Bun.\x1b[0m");
  process.exit(1);
}

// Get command-line arguments
const args = process.argv.slice(2);
const protocol = args[0]; // "ipfs" for ipfs://, else HTTPS gateway
const uri = args[1]; // Initial URI
const size = parseInt(args[2], 10); // Number of tokens
const extension = args[3]; // File extension (e.g., "jpeg")
const name = args[4]; // Metadata name prefix
const destDir = args[5] || "metadata"; // Destination directory, optional

// Validate arguments
if (args.length < 5 || !protocol || !uri || isNaN(size) || size <= 0 || !name) {
  console.error(
    "\x1b[31mError: Missing or invalid arguments.\x1b[0m\n" +
      "\x1b[34mUsage:\x1b[0m bun script.js <protocol> <uri> <size> <extension> <name> [destDir]\n" +
      "  \x1b[34mprotocol:\x1b[0m 'ipfs' for ipfs://, '0' or 'https' for HTTPS gateway\n" +
      "  \x1b[34muri:\x1b[0m Initial IPFS URI (overridden if uploaded to Pinata)\n" +
      "  \x1b[34mextension:\x1b[0m File extension (e.g., 'jpeg')\n" +
      "  \x1b[34msize:\x1b[0m Number of tokens (positive integer)\n" +
      "  \x1b[34mname:\x1b[0m Metadata name prefix (e.g., 'HouseUrban')\n" +
      "  \x1b[34mdestDir:\x1b[0m Output directory (optional, default: 'metadata')\n",
  );
  process.exit(1);
}

// Clean extension (remove leading dots)
const cleanedExtension = extension.startsWith(".")
  ? extension.slice(1)
  : extension;

// Determine protocol prefix
const prefix =
  protocol === "ipfs" ? "ipfs://" : "https://gateway.pinata.cloud/ipfs/";

// Check for pinata-cli availability
const { execSync } = require("child_process");
const hasPinataCli = (() => {
  try {
    execSync("pinata-cli --version", { stdio: "ignore" });
    return true;
  } catch (error) {
    console.log(
      "\x1b[37mpinata-cli not found. Skipping upload and using provided URI.\x1b[0m",
    );
    return false;
  }
})();

// Function to upload to Pinata and return new hash
const uploadToPinata = async (dir) => {
  console.log(`\x1b[37mTrying to upload: ${dir}\x1b[0m`);
  const cmd = ["pinata-cli", "-u", dir];
  console.log(`\x1b[37mExecuting:\x1b[0m ${cmd.join(" ")}`);

  const process = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
  const stdout = new TextDecoder().decode(process.stdout);
  const stderr = new TextDecoder().decode(process.stderr);
  const response = stdout || stderr;
  console.log("\x1b[37mResponse from Pinata:\x1b[0m", response.trim());

  const hashMatch = response.match(/IpfsHash: '([^']+)'/);
  if (!hashMatch)
    throw new Error(
      "\x1b[31mCould not extract IPFS hash from Pinata response\x1b[0m",
    );
  return hashMatch[1];
};

// Function to write metadata files
const writeMetadata = async (
  dir,
  metadataPrefix,
  imageUri,
  count,
  isUpdated = false,
) => {
  for (let i = 0; i < count; i++) {
    const image = `${i}.${cleanedExtension}`;
    const metadata = {
      name: `${metadataPrefix} #${i}`,
      image: `${prefix}${imageUri}/${image}`,
    };

    const filePath = `${dir}/${i}.json`;

    try {
      await Bun.write(filePath, JSON.stringify(metadata, null, 2));
      if (!isUpdated)
        console.log(`\x1b[37mGenerated metadata for ${i}.json\x1b[0m`);
    } catch (error) {
      console.error(
        `\x1b[31mFailed to generate metadata for ${i}.json:\x1b[0m`,
        error,
      );
    }
  }
};

// Main function to generate metadata and optionally upload
const generateMetadata = async () => {
  console.log(`\x1b[37mGenerating metadata in '${destDir}'...\x1b[0m`);

  // Generate initial metadata
  await writeMetadata(destDir, name, uri, size);
  console.log(`\x1b[37mMetadata generation complete!\x1b[0m`);

  // If pinata-cli is available, upload and update metadata
  if (hasPinataCli) {
    try {
      console.log("\x1b[37mUploading to Pinata...\x1b[0m");
      const newHash = await uploadToPinata(destDir);
      console.log(`\x1b[37mPinning complete: \x1b[34m${newHash}\x1b[0m`);

      // Update metadata only if a new hash is obtained
      console.log("\x1b[37mUpdating metadata with new Pinata URI...\x1b[0m");
      await writeMetadata(destDir, name, newHash, size, true);
      console.log(
        "\x1b[37mMetadata successfully updated with new Pinata URI.\x1b[0m",
      );
    } catch (error) {
      console.error(
        "\x1b[31mFailed to upload to Pinata or update metadata:\x1b[0m",
        error,
      );
    }
  }
};

// Run the metadata generation
generateMetadata();
