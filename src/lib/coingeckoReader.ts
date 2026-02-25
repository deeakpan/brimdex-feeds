import feedsConfig from '../../config/feeds.json'

export interface CoinGeckoFeedConfig {
  feedId: string
  pair: string
  coinId: string
  decimals: number
}

export interface CoinGeckoPriceData {
  feedId: string
  pair: string
  price: bigint
  timestamp: bigint
  roundId: bigint // Using timestamp as roundId for CoinGecko
  decimals: number
}

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

/**
 * Fetches the latest price data from CoinGecko API.
 */
export async function fetchCoinGeckoPrice(feedConfig: CoinGeckoFeedConfig): Promise<CoinGeckoPriceData> {
  console.log(`Fetching ${feedConfig.pair} from CoinGecko...`)
  
  try {
    const url = `${COINGECKO_API_BASE}/simple/price?ids=${feedConfig.coinId}&vs_currencies=usd&include_last_updated_at=true`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json() as Record<string, { usd?: number; last_updated_at?: number }>
    const coinData = data[feedConfig.coinId]
    
    if (!coinData || !coinData.usd) {
      throw new Error(`No price data found for ${feedConfig.coinId}`)
    }
    
    const priceUsd = coinData.usd
    const lastUpdated = coinData.last_updated_at || Math.floor(Date.now() / 1000)
    
    // Convert price to int256 with proper decimals (multiply by 10^decimals)
    const priceScaled = BigInt(Math.floor(priceUsd * 10 ** feedConfig.decimals))
    
    console.log(`CoinGecko ${feedConfig.pair}: $${priceUsd}, Updated ${new Date(lastUpdated * 1000).toISOString()}`)
    
    return {
      feedId: feedConfig.feedId,
      pair: feedConfig.pair,
      price: priceScaled,
      timestamp: BigInt(lastUpdated),
      roundId: BigInt(lastUpdated), // Use timestamp as roundId for CoinGecko
      decimals: feedConfig.decimals,
    }
  } catch (error: any) {
    console.error(`Failed to read ${feedConfig.pair} from CoinGecko: ${error.message}`)
    throw error
  }
}

/**
 * Gets all CoinGecko feed configurations.
 */
export function getCoinGeckoFeeds(): CoinGeckoFeedConfig[] {
  return feedsConfig.coingecko.feeds
}
