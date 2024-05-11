import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import type { Builder } from "./types";
import { ethers, isAddress, isHexString, parseEther } from "ethers";
import { JsonRpcProvider } from "ethers";
import { writeFile } from "node:fs/promises";

const socialsToBitmap = (
  hasTelegram: boolean,
  hasTwitter: boolean,
  hasGithub: boolean,
  hasDiscord: boolean,
  hasEmail: boolean,
  hasInstagram: boolean,
) => {
  return (
    (hasTelegram ? 1 : 0) +
    (hasTwitter ? 2 : 0) +
    (hasGithub ? 4 : 0) +
    (hasDiscord ? 8 : 0) +
    (hasEmail ? 16 : 0) +
    (hasInstagram ? 32 : 0)
  );
};

export const rawBuilderToLeaf = (builder: Builder) => [
  builder.id,
  Boolean(builder.stream && builder.stream.streamAddress),
  parseEther(String(builder.stream?.cap ?? 0)),
  parseEther(String(builder.stream?.balance ?? 0)),
  String(builder.stream?.frequency ?? 0),
  // we use || instead of ?? because the address could be an empty string
  builder.stream?.streamAddress || "0x0000000000000000000000000000000000000000",
  String(builder.stream?.lastIndexedBlock ?? 0),
  String(builder.builds?.length ?? 0),
  socialsToBitmap(
    Boolean(builder.socialLinks?.telegram),
    Boolean(builder.socialLinks?.twitter),
    Boolean(builder.socialLinks?.github),
    Boolean(builder.socialLinks?.discord),
    Boolean(builder.socialLinks?.email),
    Boolean(builder.socialLinks?.instagram),
  ),
];

const BUILDERS_ENDPOINT =
  process.env["BUILDERS_ENDPOINT"] ?? "https://buidlguidl-v3.ew.r.appspot.com/builders";

const fetchBuidlersData = async () => {
  const res = await fetch(BUILDERS_ENDPOINT);
  return (await res.json()) as Builder[];
};

const cacheBuidlers = async (buidlers: Builder[]) => {
  const BUILDERS_PATH = process.env["BUILDERS_PATH"] ?? "src/lib/buidlers.json";

  await writeFile(BUILDERS_PATH, JSON.stringify(buidlers));
};

const updateAddressesTree = async (data: Builder[]) => {
  const ADDRESSES_TREE_PATH = process.env["ADDRESSES_TREE_PATH"] ?? "src/lib/addresses-tree.json";

  const addresses = data.map((builder) => [builder.id]);
  const tree = StandardMerkleTree.of(addresses, ["address"]);

  await writeFile(ADDRESSES_TREE_PATH, JSON.stringify(tree.dump()));

  return tree.root;
};

const updateBuidlersTree = async (data: Builder[]) => {
  const BUIDLERS_TREE_PATH = process.env["BUIDLERS_TREE_PATH"] ?? "src/lib/buidlers-tree.json";

  const buidlers = data.map(rawBuilderToLeaf);
  const tree = StandardMerkleTree.of(buidlers, [
    "address",
    "bool",
    "uint256",
    "uint256",
    "uint256",
    "address",
    "uint256",
    "uint256",
    "uint256",
  ]);

  await writeFile(
    BUIDLERS_TREE_PATH,
    JSON.stringify(tree.dump(), (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  );

  return tree.root;
};

const updateContractRoot = async (addressesRoot: string, buidlersRoot: string) => {
  const CONTRACT_ADDRESS = process.env["CONTRACT_ADDRESS"];

  if (!CONTRACT_ADDRESS || !isAddress(CONTRACT_ADDRESS)) {
    throw new Error("CONTRACT_ADDRESS is required");
  }

  const RPC_URL =
    process.env["RPC_URL"] ?? "https://sepolia.infura.io/v3/b22c7c86a99d48f78f0e1ef1d32da706";
  const PRIVATE_KEY = process.env["PRIVATE_KEY"];

  if (!PRIVATE_KEY || isHexString(PRIVATE_KEY, 32)) {
    throw new Error("PRIVATE_KEY is required");
  }

  const provider = new JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);

  const contract = new ethers.Contract(
    CONTRACT_ADDRESS,
    [
      "function updateRoots(bytes32 _addressesRoot, bytes32 _buidlersRoot) public",
      "function addressesRoot() public view returns (bytes32)",
      "function buidlersRoot() public view returns (bytes32)",
    ],
    signer,
  );

  const currentAddressesRoot = await contract.addressesRoot();
  const currentBuidlersRoot = await contract.buidlersRoot();

  if (currentAddressesRoot === addressesRoot && currentBuidlersRoot === buidlersRoot) {
    console.log("No changes in the trees");
    process.exit(0);
  }

  const tx = await contract.updateRoots(addressesRoot, buidlersRoot);

  console.log(`Updated trees roots ${addressesRoot} and ${buidlersRoot} in tx ${tx.hash}`);
};

export const update = async () => {
  const data = await fetchBuidlersData();

  await cacheBuidlers(data);

  const addressesRoot = await updateAddressesTree(data);
  const buidlersRoot = await updateBuidlersTree(data);

  await updateContractRoot(addressesRoot, buidlersRoot);
};
