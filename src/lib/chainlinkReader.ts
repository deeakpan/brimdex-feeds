import { parseAbi, Address } from 'viem'
import { basePublicClient } from './clients'
import feedsConfig from '../../config/feeds.json'

// Minimal ABI for AggregatorV3Interface
const CHAINLINK_ABI = parseAbi([
  'function latestRoundData() external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() external view returns (uint8)',
])

export interface ChainlinkFeedConfig {
  feedId: string
  pair: string
  address: string
  decimals: number
  deviationThreshold: number
  heartbeat: number
}

export interface PriceData {
  feedId: string
  pair: string
  roundId: bigint
  price: bigint
  timestamp: bigint
  decimals: number
}

/**
 * Fetches the latest price data from a Chainlink feed on Base.
 */
export async function fetchChainlinkPrice(feedConfig: ChainlinkFeedConfig): Promise<PriceData> {
  console.log(`Fetching ${feedConfig.pair} from Chainlink on Base...`)
  
  try {
    const feedAddress = feedConfig.address as Address
    
    const [roundData, decimals] = await Promise.all([
      basePublicClient.readContract({
        address: feedAddress,
        abi: CHAINLINK_ABI,
        functionName: 'latestRoundData',
      }),
      basePublicClient.readContract({
        address: feedAddress,
        abi: CHAINLINK_ABI,
        functionName: 'decimals',
      })
    ])

    const [roundId, answer, , updatedAt] = roundData
    
    console.log(`Chainlink ${feedConfig.pair}: Round ${roundId}, Price ${answer}`)
    
    return {
      feedId: feedConfig.feedId,
      pair: feedConfig.pair,
      roundId,
      price: answer,
      timestamp: updatedAt,
      decimals: Number(decimals),
    }
  } catch (error: any) {
    console.error(`Failed to read ${feedConfig.pair} from Chainlink: ${error.message}`)
    throw error
  }
}

/**
 * Gets all Chainlink feed configurations for Base.
 */
export function getChainlinkFeeds(): ChainlinkFeedConfig[] {
  return feedsConfig.chainlink.base.feeds
}
