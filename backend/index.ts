import { Hono } from 'hono';
import { ethers } from 'ethers';
import { cors } from 'hono/cors';

const app = new Hono();

// Middleware
app.use(cors());

// Environment variables
const port = process.env.PORT || 3000;
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'https://rpc.ankr.com/eth');

// Routes
app.get('/', (c) => {
  return c.json({ message: 'Welcome to the W3 Playground API' });
});

// Get ETH balance
app.get('/api/balance/:address', async (c) => {
  try {
    const { address } = c.req.param();
    
    if (!ethers.isAddress(address)) {
      return c.json({ error: 'Invalid Ethereum address' }, 400);
    }
    
    const balance = await provider.getBalance(address);
    return c.json({
      address,
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString()
    });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return c.json({ error: 'Failed to fetch balance' }, 500);
  }
});

// Get gas price
app.get('/api/gas', async (c) => {
  try {
    const feeData = await provider.getFeeData();
    return c.json({
      gasPrice: ethers.formatUnits(feeData.gasPrice || 0, 'gwei'),
      maxFeePerGas: feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : null,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : null
    });
  } catch (error) {
    console.error('Error fetching gas price:', error);
    return c.json({ error: 'Failed to fetch gas price' }, 500);
  }
});

// Start the server
console.log(`Server started on port ${port}`);
export default {
  port,
  fetch: app.fetch
};
