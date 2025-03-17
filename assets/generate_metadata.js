// Check if running in Bun
if (typeof Bun === "undefined") {
  console.error("Error: This script must be run with Bun.");
  process.exit(1);
}

// Check for pinata-cli availability (simplified check)
const { execSync } = require("child_process");
try {
  execSync("pinata-cli --version", { stdio: "ignore" });
} catch (error) {
  console.error(
    "Error: pinata-cli not found. Cannot upload directly. Please upload your files to Pinata manually and provide the resulting URI.",
  );
  process.exit(1);
}

// Get command-line arguments
const args = process.argv.slice(2);
const uri = args[0];
const size = parseInt(args[1], 10);
const extension = args[2];
const namePrefix = args[3];
const destDir = args[4] || "metadata"; // Default to "metadata" if not provided

// Validate arguments
if (
  args.length < 4 ||
  !uri ||
  isNaN(size) ||
  size <= 0 ||
  !extension ||
  !namePrefix
) {
  console.error(
    "Error: Missing or invalid arguments.\n" +
    "Usage: bun script.js <uri> <size> <extension> <namePrefix> [destDir]\n" +
    "Example: bun script.js ipfs://QmP3fEtx8zDNrk9QGuXKjfUNmKjQJ7MR97gCc4dcTf8qbK 3 jpeg 'MyNFT' output",
  );
  process.exit(1);
}

// Clean extension (remove leading dots)
const cleanedExtension = extension.startsWith(".")
  ? extension.slice(1)
  : extension;

// Simulated Pinata upload function
const ipa = async (dir) => {
  console.log(`Simulating Pinata upload for directory: ${dir}`);
  // In reality: pinata-cli -u "$1"
  return uri; // Return the provided URI for now (mocked)
};

// Function to generate metadata
const generateMetadata = async () => {
  // Simulate Pinata upload (mocked)
  const uploadedUri = await ipa(destDir);

  for (let i = 0; i < size; i++) {
    const image = `${i}.${cleanedExtension}`;
    const metadata = {
      name: `${namePrefix} #${i}`,
      image: `ipfs://${uploadedUri}/${image}`, // Prepend ipfs://
    };

    const filePath = `${destDir}/${i}.json`;

    try {
      await Bun.write(filePath, JSON.stringify(metadata, null, 2));
      console.log(`Generated metadata for ${i}.json`);
    } catch (error) {
      console.error(`Failed to generate metadata for ${i}.json:`, error);
    }
  }

  console.log(
    `All metadata files generated successfully in the '${destDir}' directory!`,
  );
};

// Run the metadata generation
generateMetadata();
