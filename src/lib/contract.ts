import 'dotenv/config'
import { createPublicClient, createWalletClient, http, Address } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { somniaTestnet } from './chain'

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

// PriceFeedRegistry ABI
export const PRICE_FEED_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'string', name: 'feedName', type: 'string' }],
    name: 'getFeedId',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'feedName', type: 'string' },
      { internalType: 'int256', name: 'price', type: 'int256' },
      { internalType: 'uint80', name: 'roundId', type: 'uint80' },
      { internalType: 'uint8', name: 'decimals', type: 'uint8' },
    ],
    name: 'updateFeedByName',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string', name: 'feedName', type: 'string' }],
    name: 'getFeedByName',
    outputs: [
      {
        components: [
          { internalType: 'int256', name: 'price', type: 'int256' },
          { internalType: 'uint64', name: 'timestamp', type: 'uint64' },
          { internalType: 'uint80', name: 'roundId', type: 'uint80' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
        ],
        internalType: 'struct BrimdexFeeds.PriceData',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'string[]', name: 'feedNames', type: 'string[]' }],
    name: 'getFeedsByName',
    outputs: [
      {
        components: [
          { internalType: 'int256', name: 'price', type: 'int256' },
          { internalType: 'uint64', name: 'timestamp', type: 'uint64' },
          { internalType: 'uint80', name: 'roundId', type: 'uint80' },
          { internalType: 'uint8', name: 'decimals', type: 'uint8' },
        ],
        internalType: 'struct BrimdexFeeds.PriceData[]',
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllFeedIds',
    outputs: [{ internalType: 'bytes32[]', name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getFeedCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export interface PriceData {
  price: bigint
  timestamp: bigint
  roundId: bigint
  decimals: number
}

// Helper to ensure private key has 0x prefix
function normalizePrivateKey(key: string): `0x${string}` {
  if (key.startsWith('0x')) {
    return key as `0x${string}`
  }
  return `0x${key}` as `0x${string}`
}

// Wallet client for writing
const walletClient = createWalletClient({
  account: privateKeyToAccount(normalizePrivateKey(getEnv('PRIVATE_KEY_SOMNIA'))),
  chain: somniaTestnet,
  transport: http(getEnv('RPC_URL_SOMNIA')),
})

// Public client for reading
const publicClient = createPublicClient({
  chain: somniaTestnet,
  transport: http(getEnv('RPC_URL_SOMNIA')),
})

export function getContractAddress(): Address {
  const address = getEnv('PRICE_FEED_REGISTRY_ADDRESS')
  if (!address.startsWith('0x')) {
    throw new Error('Invalid contract address format')
  }
  return address as Address
}

/**
 * Update a feed in the BrimdexFeeds contract using feedId from config
 */
export async function updateFeed(
  feedId: string,
  price: bigint,
  roundId: bigint,
  decimals: number
): Promise<string> {
  const contractAddress = getContractAddress()
  
  const hash = await walletClient.writeContract({
    address: contractAddress,
    abi: PRICE_FEED_REGISTRY_ABI,
    functionName: 'updateFeedByName',
    args: [feedId, price, roundId, decimals],
  })

  await publicClient.waitForTransactionReceipt({ hash })
  return hash
}

/**
 * Get a feed from the PriceFeedRegistry contract
 */
export async function getFeed(feedName: string): Promise<PriceData> {
  const contractAddress = getContractAddress()
  
  const result = await publicClient.readContract({
    address: contractAddress,
    abi: PRICE_FEED_REGISTRY_ABI,
    functionName: 'getFeedByName',
    args: [feedName],
  })

  return {
    price: result.price,
    timestamp: result.timestamp,
    roundId: result.roundId,
    decimals: result.decimals,
  }
}

/**
 * Get multiple feeds at once
 */
export async function getFeeds(feedNames: string[]): Promise<PriceData[]> {
  const contractAddress = getContractAddress()
  
  const results = await publicClient.readContract({
    address: contractAddress,
    abi: PRICE_FEED_REGISTRY_ABI,
    functionName: 'getFeedsByName',
    args: [feedNames],
  })

  return results.map((r) => ({
    price: r.price,
    timestamp: r.timestamp,
    roundId: r.roundId,
    decimals: r.decimals,
  }))
}

/**
 * Get all registered feed IDs
 */
export async function getAllFeedIds(): Promise<string[]> {
  const contractAddress = getContractAddress()
  
  const feedIds = await publicClient.readContract({
    address: contractAddress,
    abi: PRICE_FEED_REGISTRY_ABI,
    functionName: 'getAllFeedIds',
  })

  return feedIds.map((id) => id)
}
