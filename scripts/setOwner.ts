import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const contractAddress = process.env.PRICE_FEED_REGISTRY_ADDRESS;
  if (!contractAddress) {
    throw new Error("PRICE_FEED_REGISTRY_ADDRESS not set in .env");
  }

  const privateKey = process.env.PRIVATE_KEY_SOMNIA;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY_SOMNIA not set in .env");
  }

  // Normalize private key
  const normalizedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  // Create wallet from private key
  const wallet = new ethers.Wallet(normalizedKey);
  console.log("Bot wallet address:", wallet.address);

  // Connect to network
  const provider = new ethers.JsonRpcProvider(
    process.env.RPC_URL_SOMNIA || "https://dream-rpc.somnia.network"
  );
  const signer = wallet.connect(provider);

  console.log("Connecting to BrimdexFeeds at:", contractAddress);

  const BrimdexFeeds = await ethers.getContractFactory("BrimdexFeeds");
  const contract = BrimdexFeeds.attach(contractAddress).connect(signer);

  // Get current owner
  const currentOwner = await contract.owner();
  console.log("Current owner:", currentOwner);

  // Transfer ownership to bot's address
  console.log(`\nTransferring ownership to bot address: ${wallet.address}`);
  const tx = await contract.transferOwnership(wallet.address);
  await tx.wait();
  console.log("✓ Ownership transferred!");

  const newOwner = await contract.owner();
  console.log("New owner:", newOwner);
  console.log("\nContract is now owner-only. Only this address can update feeds.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
