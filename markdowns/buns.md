--Install dependencies:
bun install:all

--Run the frontend and backend together:
bun run dev

--To work with smart contracts:
cd contracts
bun run node  # Start local Ethereum node
bun run deploy  # Deploy contracts
bun run test  # Run tests