// This schema will store historical price snapshots
export const priceFeedSchema = 
  'uint64 timestamp, int256 price, uint80 roundId, string pair'
