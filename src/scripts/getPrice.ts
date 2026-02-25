import 'dotenv/config'
import { getFeed } from '../lib/contract'

async function main() {
  const feedName = process.argv[2] // e.g., "ETH/USD"
  
  if (!feedName) {
    console.error('Usage: npm run get-price ETH/USD')
    process.exit(1)
  }

  try {
    const feed = await getFeed(feedName)
    
    const priceFloat = Number(feed.price) / 10 ** feed.decimals
    const dateStr = new Date(Number(feed.timestamp) * 1000).toISOString()
    
    console.log(`\n${feedName} Price Feed:`)
    console.log(`  Price: $${priceFloat.toFixed(2)}`)
    console.log(`  Updated: ${dateStr}`)
    console.log(`  Round ID: ${feed.roundId}`)
    console.log(`  Decimals: ${feed.decimals}\n`)
  } catch (error: any) {
    if (error.message?.includes('Feed does not exist')) {
      console.error(`\nFeed "${feedName}" does not exist in the contract.`)
      console.log('Run the snapshot bot first to populate feeds.\n')
    } else {
      console.error(`\nError: ${error.message}\n`)
    }
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
