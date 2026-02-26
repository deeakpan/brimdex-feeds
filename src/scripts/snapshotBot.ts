import 'dotenv/config'
import { fetchChainlinkPrice, getChainlinkFeeds } from '../lib/chainlinkReader'
import { fetchCoinGeckoPrice, getCoinGeckoFeeds } from '../lib/coingeckoReader'
import { updateFeed } from '../lib/contract'

const UPDATE_INTERVAL_MS = 600000 // 10 minutes

async function processAllFeeds() {
  // Get all feeds to process
  const chainlinkFeeds = getChainlinkFeeds()
  const coingeckoFeeds = getCoinGeckoFeeds()
  
  console.log(`\n[${new Date().toISOString()}] Processing ${chainlinkFeeds.length} Chainlink feeds and ${coingeckoFeeds.length} CoinGecko feeds...`)

  // Process Chainlink feeds sequentially with delays to avoid rate limits
  for (const feedConfig of chainlinkFeeds) {
    try {
      // Fetch data from Chainlink
      const priceData = await fetchChainlinkPrice(feedConfig)

      // Update contract using feedId from config
      const txHash = await updateFeed(
        priceData.feedId,
        priceData.price,
        priceData.roundId,
        priceData.decimals
      )

      console.log(`✓ ${feedConfig.pair} - Price: ${priceData.price}, Tx: ${txHash.slice(0, 10)}...`)
      
      // Delay between Chainlink feeds to avoid rate limits (10 seconds)
      await new Promise(resolve => setTimeout(resolve, 10000))
    } catch (error: any) {
      console.error(`✗ ${feedConfig.pair}: ${error.message}`)
      // Wait longer on rate limit errors
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        console.log(`  Rate limited, waiting 15 seconds before next feed...`)
        await new Promise(resolve => setTimeout(resolve, 15000))
      }
      // Continue with next feed even if one fails
    }
  }

  // Process CoinGecko feeds sequentially with delays
  for (const feedConfig of coingeckoFeeds) {
    try {
      // Fetch data from CoinGecko
      const priceData = await fetchCoinGeckoPrice(feedConfig)

      // Update contract using feedId from config
      const txHash = await updateFeed(
        priceData.feedId,
        priceData.price,
        priceData.roundId,
        priceData.decimals
      )

      console.log(`✓ ${feedConfig.pair} - Price: ${priceData.price}, Tx: ${txHash.slice(0, 10)}...`)
      
      // Delay after CoinGecko feed (10 seconds)
      await new Promise(resolve => setTimeout(resolve, 10000))
    } catch (error: any) {
      console.error(`✗ ${feedConfig.pair}: ${error.message}`)
      // Wait longer on rate limit errors
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        console.log(`  Rate limited, waiting 20 seconds before retry...`)
        await new Promise(resolve => setTimeout(resolve, 20000))
      }
      // Continue with next feed even if one fails
    }
  }
}

async function main() {
  console.log('--- Starting Continuous Snapshot Bot ---')
  console.log(`Update interval: ${UPDATE_INTERVAL_MS / 1000} seconds`)
  console.log('Press Ctrl+C to stop\n')

  // Run immediately, then every 10 minutes
  while (true) {
    try {
      await processAllFeeds()
      const waitMinutes = UPDATE_INTERVAL_MS / 60000
      console.log(`\n✓ All feeds updated. Next update in ${waitMinutes} minutes...`)
      
      // Wait with periodic heartbeat to show bot is alive
      const heartbeatInterval = 60000 // Log every 1 minute
      let elapsed = 0
      
      while (elapsed < UPDATE_INTERVAL_MS) {
        await new Promise(resolve => setTimeout(resolve, heartbeatInterval))
        elapsed += heartbeatInterval
        const remaining = Math.ceil((UPDATE_INTERVAL_MS - elapsed) / 60000)
        if (remaining > 0) {
          console.log(`  Bot alive... ${remaining} minute(s) until next update`)
        }
      }
    } catch (error: any) {
      console.error(`Error in update cycle: ${error.message}`)
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL_MS))
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\nShutting down bot...')
  process.exit(0)
})

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
