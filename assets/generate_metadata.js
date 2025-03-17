// Check if running in Bun
if (typeof Bun === "undefined") {
  console.error("Error: This script must be run with Bun.");
  process.exit(1);
}

// Check for pinata-cli availability
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

// Function to generate metadata
const generateMetadata = async () => {
  for (let i = 0; i < size; i++) {
    const image = `${i}.${cleanedExtension}`;
    const metadata = {
      name: `${namePrefix} #${i}`,
      image: `ipfs://${uri}/${image}`, // Prepend ipfs://
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

  // Upload to Pinata after metadata generation
  console.log(`Trying to upload: ${destDir}`);
  const cmd = ["pinata-cli", "-u", destDir];
  console.log(`Executing: ${cmd.join(" ")}`);

  try {
    const process = Bun.spawnSync(cmd, { stdout: "pipe", stderr: "pipe" });
    const stdout = new TextDecoder().decode(process.stdout);
    const stderr = new TextDecoder().decode(process.stderr);
    const response = stdout || stderr; // Use stderr if stdout is empty
    console.log("Response from Pinata:", response.trim());
  } catch (error) {
    console.error("Failed to upload to Pinata:", error);
  }
};

// Run the metadata generation and upload
generateMetadata();
