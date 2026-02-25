import 'dotenv/config'
import { fetchChainlinkPrice, getChainlinkFeeds } from '../lib/chainlinkReader'
import { fetchCoinGeckoPrice, getCoinGeckoFeeds } from '../lib/coingeckoReader'
import { updateFeed } from '../lib/contract'

const UPDATE_INTERVAL_MS = 5000 // 5 seconds

async function processAllFeeds() {
  // Get all feeds to process
  const chainlinkFeeds = getChainlinkFeeds()
  const coingeckoFeeds = getCoinGeckoFeeds()
  
  console.log(`\n[${new Date().toISOString()}] Processing ${chainlinkFeeds.length} Chainlink feeds and ${coingeckoFeeds.length} CoinGecko feeds...`)

  // Process Chainlink feeds sequentially
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
    } catch (error: any) {
      console.error(`✗ ${feedConfig.pair}: ${error.message}`)
      // Continue with next feed even if one fails
    }
  }

  // Process CoinGecko feeds sequentially
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
    } catch (error: any) {
      console.error(`✗ ${feedConfig.pair}: ${error.message}`)
      // Continue with next feed even if one fails
    }
  }
}

async function main() {
  console.log('--- Starting Continuous Snapshot Bot ---')
  console.log(`Update interval: ${UPDATE_INTERVAL_MS / 1000} seconds`)
  console.log('Press Ctrl+C to stop\n')

  // Run immediately, then every 5 seconds
  while (true) {
    try {
      await processAllFeeds()
      console.log(`\nWaiting ${UPDATE_INTERVAL_MS / 1000} seconds until next update...`)
      await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL_MS))
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
