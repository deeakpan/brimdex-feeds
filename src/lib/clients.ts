import 'dotenv/config'
import { createPublicClient, http } from 'viem'
import { base } from './chain'

function getEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing environment variable: ${key}`)
  return value
}

// === Base Public Client (Read-Only for Chainlink) ===
export const basePublicClient = createPublicClient({
  chain: base,
  transport: http(getEnv('BASE_RPC_URL')),
})
