import { defineChain } from 'viem'
import { base as baseMainnet } from 'viem/chains'

// Base Mainnet
export const base = baseMainnet

// Somnia Testnet
export const somniaTestnet = defineChain({
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: { name: 'STT', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.RPC_URL_SOMNIA || ''] },
    public:  { http: [process.env.RPC_URL_SOMNIA || ''] },
  },
} as const)
