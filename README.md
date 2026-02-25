# BrimdexFeeds - On-Chain Price Feed Registry

A decentralized price feed registry contract on Somnia Testnet that provides real-time price data for multiple cryptocurrency pairs.

## Contract Address

**BrimdexFeeds:** `0xe24cB9468a690E33dDbC365BD29F8E1B53e48F93`  
**Network:** Somnia Testnet (Chain ID: 50312)

## Available Feeds

- **BNB/USD** - Binance Coin price in USD
- **BTC/USD** - Bitcoin price in USD
- **ETH/USD** - Ethereum price in USD
- **SOL/USD** - Solana price in USD
- **SOMI/USD** - Somnia token price in USD

## Reading Prices from the Contract

### From Solidity

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBrimdexFeeds {
    struct PriceData {
        int256 price;
        uint64 timestamp;
        uint80 roundId;
        uint8 decimals;
    }
    
    function getFeedByName(string memory feedName) external view returns (PriceData memory);
    function getFeed(bytes32 feedId) external view returns (PriceData memory);
    function getFeedsByName(string[] memory feedNames) external view returns (PriceData[] memory);
}

contract MyContract {
    IBrimdexFeeds constant FEEDS = IBrimdexFeeds(0xe24cB9468a690E33dDbC365BD29F8E1B53e48F93);
    
    function getETHPrice() external view returns (int256 price, uint64 timestamp) {
        IBrimdexFeeds.PriceData memory data = FEEDS.getFeedByName("ETH/USD");
        return (data.price, data.timestamp);
    }
    
    function getMultiplePrices() external view returns (int256 ethPrice, int256 btcPrice) {
        IBrimdexFeeds.PriceData[] memory feeds = FEEDS.getFeedsByName(
            new string[](2)
        );
        feeds[0] = FEEDS.getFeedByName("ETH/USD");
        feeds[1] = FEEDS.getFeedByName("BTC/USD");
        
        ethPrice = feeds[0].price;
        btcPrice = feeds[1].price;
    }
}
```

### From JavaScript/TypeScript

```typescript
import { createPublicClient, http } from 'viem'
import { somniaTestnet } from './chain'

const client = createPublicClient({
  chain: somniaTestnet,
  transport: http('https://dream-rpc.somnia.network')
})

// Get single feed
const feed = await client.readContract({
  address: '0xe24cB9468a690E33dDbC365BD29F8E1B53e48F93',
  abi: [{
    name: 'getFeedByName',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'feedName', type: 'string' }],
    outputs: [{
      components: [
        { name: 'price', type: 'int256' },
        { name: 'timestamp', type: 'uint64' },
        { name: 'roundId', type: 'uint80' },
        { name: 'decimals', type: 'uint8' }
      ],
      name: '',
      type: 'tuple'
    }]
  }],
  functionName: 'getFeedByName',
  args: ['ETH/USD']
})

const priceFloat = Number(feed.price) / 10 ** feed.decimals
console.log(`ETH/USD: $${priceFloat.toFixed(2)}`)
```

### Using the CLI Tool

```bash
npm run get-price ETH/USD
```

## Contract Functions

### Reading Functions

- `getFeedByName(string memory feedName)` - Get price data by feed name (e.g., "ETH/USD")
- `getFeed(bytes32 feedId)` - Get price data by bytes32 feed ID
- `getFeedsByName(string[] memory feedNames)` - Get multiple feeds at once
- `getFeedCount()` - Get total number of registered feeds
- `getAllFeedIds()` - Get all registered feed IDs

### PriceData Structure

```solidity
struct PriceData {
    int256 price;      // Price scaled by decimals (e.g., 192179299200 = $1921.79 with 8 decimals)
    uint64 timestamp;  // Unix timestamp when price was last updated
    uint80 roundId;    // Round ID from the price source
    uint8 decimals;    // Number of decimals (typically 8)
}
```

### Converting Price to USD

To convert the stored price to a human-readable USD value:

```solidity
uint256 priceUSD = uint256(priceData.price) / (10 ** priceData.decimals);
```

Or in JavaScript:
```javascript
const priceUSD = Number(priceData.price) / (10 ** priceData.decimals)
```

## Network Information

- **Network Name:** Somnia Testnet
- **Chain ID:** 50312
- **RPC URL:** https://dream-rpc.somnia.network
- **Explorer:** Check Somnia documentation for block explorer URL

## Notes

- Prices are updated regularly on-chain
- All functions are view-only (no gas required for reading)
- Feed names are case-sensitive (e.g., "ETH/USD" not "eth/usd")
- Prices are stored as integers scaled by decimals for precision
