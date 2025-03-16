.PHONY: help env test compile deploy clean print-env node accounts create-wallet

# Default target
help:
	@echo "Available commands:"
	@echo "  make test            - Run Hardhat tests using Bun"
	@echo "  make compile         - Compile smart contracts"
	@echo "  make deploy [network=localhost] - Deploy smart contracts to network (default: localhost)"
	@echo "  make clean           - Remove artifacts and cache"
	@echo "  make print-env       - Print all process.env variables"
	@echo "  make node            - Run local Hardhat node"
	@echo "  make accounts        - List accounts from local node"
	@echo "  make create-wallet   - Create a new Ethereum wallet"
	@echo "  make check-network   - Check current network configuration"

# Run tests
test:
	@echo "\033[1;32mRunning tests...\033[0m"
	@bunx hardhat test

# Compile contracts
compile:
	@echo "\033[1;32mCompiling contracts...\033[0m"
	@bunx hardhat compile

# Deploy contracts
# Default network is localhost if not specified
network ?= localhost
deploy:
	@echo "\033[1;32mDeploying contracts to network: $(network)...\033[0m"
	@bunx hardhat run scripts/deploy.js --network $(network)

# Clean artifacts and cache
clean:
	@echo "\033[1;33mCleaning artifacts and cache...\033[0m"
	@bunx hardhat clean
	@rm -rf cache artifacts

# Print all process.env variables
print-env:
	@echo "\033[1;34mPrinting all environment variables:\033[0m"
	@bun --print "Object.entries(process.env).forEach(([k,v]) => console.log(`\x1b[36m${k}\x1b[0m=\x1b[33m${v}\x1b[0m`))"

# Run local Hardhat node
node:
	@echo "\033[1;32mStarting local Hardhat node...\033[0m"
	@bunx hardhat node

# List accounts from local node
accounts:
	@echo "\033[1;34mListing accounts from local node...\033[0m"
	@bunx hardhat accounts

# Create a new Ethereum wallet
create-wallet:
	@echo "\033[1;32mGenerating new Ethereum wallet...\033[0m"
	@bun --print "const ethers = require('ethers'); const wallet = ethers.Wallet.createRandom(); console.log('\x1b[36mAddress:\x1b[0m', wallet.address); console.log('\x1b[36mPrivate Key:\x1b[0m', wallet.privateKey); console.log('\x1b[36mMnemonic:\x1b[0m', wallet.mnemonic.phrase);"

# Check current network configuration
check-network:
	@echo "\033[1;34mChecking current network configuration:\033[0m"
	@bun --print "const hre = require('hardhat'); console.log('\x1b[36mNetwork name:\x1b[0m', hre.network.name); console.log('\x1b[36mChain ID:\x1b[0m', hre.network.config.chainId); console.log('\x1b[36mURL:\x1b[0m', hre.network.config.url || 'Not specified');"
