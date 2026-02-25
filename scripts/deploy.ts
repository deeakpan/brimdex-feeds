import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY_SOMNIA;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY_SOMNIA not set in .env");
  }

  // Normalize private key
  const normalizedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  // Create wallet from private key
  const wallet = new ethers.Wallet(normalizedKey);
  console.log("Deploying with address:", wallet.address);

  // Connect to network
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL_SOMNIA || "https://dream-rpc.somnia.network"
  );
  const signer = wallet.connect(provider);

  console.log("Deploying BrimdexFeeds...");

  const BrimdexFeeds = await ethers.getContractFactory("BrimdexFeeds", signer);
  const registry = await BrimdexFeeds.deploy();

  await registry.waitForDeployment();

  const address = await registry.getAddress();
  console.log("BrimdexFeeds deployed to:", address);
  console.log("Owner set to:", wallet.address);
  console.log("\nSave this address to your .env file as:");
  console.log(`PRICE_FEED_REGISTRY_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
