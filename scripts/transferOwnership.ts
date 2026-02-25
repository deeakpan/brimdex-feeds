import { ethers } from "hardhat";

async function main() {
  const contractAddress = process.env.PRICE_FEED_REGISTRY_ADDRESS;
  if (!contractAddress) {
    throw new Error("PRICE_FEED_REGISTRY_ADDRESS not set in .env");
  }

  console.log("Connecting to BrimdexFeeds at:", contractAddress);

  const BrimdexFeeds = await ethers.getContractFactory("BrimdexFeeds");
  const contract = BrimdexFeeds.attach(contractAddress);

  // Get current owner
  const currentOwner = await contract.owner();
  console.log("Current owner:", currentOwner);

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Option 1: Transfer to deployer (if different from current owner)
  // Option 2: Make permissionless (anyone can update)
  
  const args = process.argv.slice(2);
  const newOwnerAddress = args[0];

  if (newOwnerAddress) {
    // Transfer ownership to specific address
    console.log(`\nTransferring ownership to: ${newOwnerAddress}`);
    const tx = await contract.transferOwnership(newOwnerAddress);
    await tx.wait();
    console.log("✓ Ownership transferred!");
  } else {
    // Make permissionless (anyone can update)
    console.log("\nMaking contract permissionless (anyone can update)...");
    const tx = await contract.makePermissionless();
    await tx.wait();
    console.log("✓ Contract is now permissionless!");
  }

  const newOwner = await contract.owner();
  console.log("New owner:", newOwner === ethers.ZeroAddress ? "Permissionless (address(0))" : newOwner);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
