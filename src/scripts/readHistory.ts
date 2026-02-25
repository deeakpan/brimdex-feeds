import 'dotenv/config'
import { getFeeds, getAllFeedIds } from '../lib/contract'
import { getChainlinkFeeds } from '../lib/chainlinkReader'
import { getCoinGeckoFeeds } from '../lib/coingeckoReader'

async function main() {
  console.log('--- Reading All Price Feeds from Contract ---\n')

  // Get all configured feed IDs from config
  const chainlinkFeeds = getChainlinkFeeds()
  const coingeckoFeeds = getCoinGeckoFeeds()
  const allFeedIds = [
    ...chainlinkFeeds.map(f => f.feedId),
    ...coingeckoFeeds.map(f => f.feedId)
  ]

  if (allFeedNames.length === 0) {
    console.log('No feeds configured.')
    return
  }

  try {
    // Fetch all feeds at once using feedIds from config
    const feeds = await getFeeds(allFeedIds)
    
    console.log(`Found ${feeds.length} feeds:\n`)
    
    feeds.forEach((feed, index) => {
      const feedId = allFeedIds[index]
      const priceFloat = Number(feed.price) / 10 ** feed.decimals
      const dateStr = new Date(Number(feed.timestamp) * 1000).toISOString()
      
      console.log(`=== ${feedId} ===`)
      console.log(`  Price: $${priceFloat.toFixed(2)}`)
      console.log(`  Updated: ${dateStr}`)
      console.log(`  Round ID: ${feed.roundId}`)
      console.log(`  Decimals: ${feed.decimals}\n`)
    })
  } catch (error: any) {
    console.error(`Error reading feeds: ${error.message}`)
    console.log('\nMake sure the contract is deployed and PRICE_FEED_REGISTRY_ADDRESS is set in .env')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
