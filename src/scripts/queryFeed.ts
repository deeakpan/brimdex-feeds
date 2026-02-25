import 'dotenv/config'
import { getFeed } from '../lib/contract'

async function main() {
  const feedName = process.argv[2] // e.g., "SOMI/USD"
  
  if (!feedName) {
    console.error('Usage: npm run query SOMI/USD')
    process.exit(1)
  }

  console.log(`--- Querying ${feedName} Feed ---\n`)

  try {
    const feed = await getFeed(feedName)
    
    const priceFloat = Number(feed.price) / 10 ** feed.decimals
    const dateStr = new Date(Number(feed.timestamp) * 1000).toISOString()
    
    console.log(`Feed: ${feedName}`)
    console.log(`Price: $${priceFloat.toFixed(2)}`)
    console.log(`Updated: ${dateStr}`)
    console.log(`Round ID: ${feed.roundId}`)
    console.log(`Decimals: ${feed.decimals}`)
  } catch (error: any) {
    if (error.message?.includes('Feed does not exist')) {
      console.error(`Feed "${feedName}" does not exist in the contract.`)
      console.log('Run the snapshot bot first to populate feeds.')
    } else {
      console.error(`Error: ${error.message}`)
      console.log('\nMake sure the contract is deployed and PRICE_FEED_REGISTRY_ADDRESS is set in .env')
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
