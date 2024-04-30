import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import type { Builder } from "./types";
import { ethers, isAddress, isHexString } from "ethers";
import { JsonRpcProvider } from "ethers";
import { writeFile } from "node:fs/promises";

// --- creating the merkle tree ---
const BUILDERS_ENDPOINT =
  process.env["BUILDERS_ENDPOINT"] ?? "https://buidlguidl-v3.ew.r.appspot.com/builders";
const ADDRESSES_TREE_PATH = process.env["ADDRESSES_TREE_PATH"] ?? "addresses-tree.json";

const res = await fetch(BUILDERS_ENDPOINT);
const json = await res.json();

const builders = json as Builder[];

const addresses = builders.map((builder) => [builder.id]);

const tree = StandardMerkleTree.of(addresses, ["address"]);
console.log(`Calculated tree root: ${tree.root}`);

await writeFile(ADDRESSES_TREE_PATH, JSON.stringify(tree.dump()));
console.log(`Wrote tree to ${ADDRESSES_TREE_PATH}`);

// --- updating merkle root in the contract ---
const CONTRACT_ADDRESS = process.env["CONTRACT_ADDRESS"];

if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
  throw new Error("CONTRACT_ADDRESS is required");
}

const RPC_URL = process.env["RPC_URL"] ?? "https://rpc.ankr.com/eth_sepolia";
const PRIVATE_KEY = process.env["PRIVATE_KEY"];

if (!PRIVATE_KEY || isHexString(PRIVATE_KEY, 32)) {
  throw new Error("PRIVATE_KEY is required");
}

const provider = new JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ["function updateTree(bytes32 _root) public", "function root() public view returns (bytes32)"],
  signer,
);

const currentRoot = await contract.root();

if (currentRoot === tree.root) {
  console.log("No changes in the tree");
  process.exit(0);
}

const tx = await contract.updateTree(tree.root);

console.log(`Updated tree root to ${tree.root} in tx ${tx.hash}`);
